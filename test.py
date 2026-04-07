import argparse
import json
import os
import re
import time
from pathlib import Path
from typing import Dict, List, Tuple

import requests

VOICES_API_URL = "https://freetts.org/api/voices"
TTS_API_URL = "https://freetts.org/api/tts"
AUDIO_API_URL_TEMPLATE = "https://freetts.org/api/audio/{file_id}"

DEFAULT_CURRICULUM_PATH = Path("src/lib/curriculum.ts")
DEFAULT_OUTPUT_ROOT = Path("public/audio/freetts")

# FreeTTS docs specify 20 requests/min per IP, so keep >= 3s between synth calls.
DEFAULT_DELAY_SECONDS = 3.2
MAX_ATTEMPTS = 3
HTTP_TIMEOUT_SECONDS = 30

CHAR_OBJECT_RE = re.compile(
    r"\{\s*glyph:\s*\"(?P<glyph>[^\"]+)\"[\s\S]*?audioLabel:\s*\"(?P<label>[^\"]+)\"[\s\S]*?\}",
    re.MULTILINE,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download Kannada character audio from FreeTTS using voices from freetts.org/voices"
    )
    parser.add_argument(
        "--curriculum",
        type=Path,
        default=DEFAULT_CURRICULUM_PATH,
        help="Path to curriculum.ts",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_ROOT,
        help="Output root folder for downloaded MP3 files",
    )
    parser.add_argument(
        "--voice",
        type=str,
        default="kn-IN-GaganNeural",
        help="Preferred FreeTTS voice short name (must exist in /api/voices)",
    )
    parser.add_argument(
        "--all-kannada-voices",
        action="store_true",
        help="Download with every Kannada voice from FreeTTS (separate subfolders)",
    )
    parser.add_argument(
        "--rate",
        type=str,
        default="+0%",
        help="TTS speaking rate, e.g. +0%%, -10%%",
    )
    parser.add_argument(
        "--pitch",
        type=str,
        default="+0Hz",
        help="TTS pitch, e.g. +0Hz, -2Hz",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=DEFAULT_DELAY_SECONDS,
        help="Delay between synth requests in seconds",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip files that already exist (useful for large incremental batches)",
    )
    return parser.parse_args()


def parse_curriculum(path: Path) -> List[Dict[str, str]]:
    text = path.read_text(encoding="utf-8")
    matches = CHAR_OBJECT_RE.finditer(text)

    by_glyph: Dict[str, Dict[str, str]] = {}
    for match in matches:
        glyph = match.group("glyph")
        label = match.group("label")

        existing = by_glyph.get(glyph)
        if existing and existing["label"] != label:
            print(
                f"[warn] Duplicate glyph with different labels: {glyph!r} -> "
                f"keeping {existing['label']!r}, skipping {label!r}"
            )
            continue

        by_glyph[glyph] = {"glyph": glyph, "label": label}

    items = list(by_glyph.values())
    if not items:
        raise RuntimeError(f"No character entries found in {path}")
    return items


def get_kannada_voices(session: requests.Session) -> List[Dict[str, str]]:
    response = session.get(VOICES_API_URL, timeout=HTTP_TIMEOUT_SECONDS)
    response.raise_for_status()

    voices = response.json()
    kannada = [v for v in voices if str(v.get("Locale", "")).startswith("kn-")]

    if not kannada:
        raise RuntimeError("No Kannada voices found from FreeTTS /api/voices")

    return kannada


def select_voices(
    kannada_voices: List[Dict[str, str]],
    preferred_short_name: str,
    all_kannada: bool,
) -> List[Tuple[str, str]]:
    short_names = [v.get("ShortName", "") for v in kannada_voices]

    if all_kannada:
        return [(sn, sn) for sn in short_names if sn]

    if preferred_short_name in short_names:
        return [(preferred_short_name, preferred_short_name)]

    fallback = short_names[0]
    print(
        f"[warn] Requested voice {preferred_short_name!r} not found. "
        f"Using {fallback!r}."
    )
    return [(fallback, fallback)]


def glyph_to_filename(glyph: str) -> str:
    codepoints = "-".join(f"{ord(ch):04X}" for ch in glyph)
    safe_glyph = "".join(ch if ch not in '\\/:*?\"<>|' else "_" for ch in glyph)
    return f"{codepoints}_{safe_glyph}.mp3"


def synthesize_to_file(
    session: requests.Session,
    voice: str,
    text: str,
    output_file: Path,
    rate: str,
    pitch: str,
) -> None:
    payload = {
        "text": text,
        "voice": voice,
        "rate": rate,
        "pitch": pitch,
    }

    last_error: Exception | None = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            tts_response = session.post(TTS_API_URL, json=payload, timeout=HTTP_TIMEOUT_SECONDS)

            if tts_response.status_code == 429:
                wait_time = min(30, 3 * attempt)
                print(f"[rate-limit] 429 from /tts. Waiting {wait_time}s and retrying...")
                time.sleep(wait_time)
                continue

            tts_response.raise_for_status()
            file_id = tts_response.json().get("file_id")
            if not file_id:
                raise RuntimeError(f"/tts response missing file_id: {tts_response.text[:200]}")

            audio_url = AUDIO_API_URL_TEMPLATE.format(file_id=file_id)
            audio_response = session.get(audio_url, timeout=HTTP_TIMEOUT_SECONDS)
            audio_response.raise_for_status()

            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_bytes(audio_response.content)
            return

        except Exception as exc:
            last_error = exc
            if attempt < MAX_ATTEMPTS:
                wait_time = 2 * attempt
                print(f"[retry] attempt {attempt}/{MAX_ATTEMPTS} failed: {exc}. Waiting {wait_time}s...")
                time.sleep(wait_time)

    raise RuntimeError(f"Failed after {MAX_ATTEMPTS} attempts: {last_error}")


def download_all(
    curriculum_items: List[Dict[str, str]],
    voices: List[Tuple[str, str]],
    output_root: Path,
    rate: str,
    pitch: str,
    delay_seconds: float,
    skip_existing: bool,
) -> None:
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "kali-freetts-downloader/1.0",
            "Accept": "application/json, audio/mpeg, */*",
        }
    )

    summary: Dict[str, Dict[str, str]] = {}

    for voice_short_name, folder_name in voices:
        voice_dir = output_root / folder_name
        voice_dir.mkdir(parents=True, exist_ok=True)
        print(f"\n[voice] {voice_short_name} -> {voice_dir}")

        manifest: List[Dict[str, str]] = []
        total = len(curriculum_items)

        for idx, item in enumerate(curriculum_items, start=1):
            glyph = item["glyph"]
            label = item["label"]
            filename = glyph_to_filename(glyph)
            target_path = voice_dir / filename

            if skip_existing and target_path.exists():
                print(f"[skip] ({idx}/{total}) {glyph} ({label}) -> {filename}")
                manifest.append(
                    {
                        "glyph": glyph,
                        "audioLabel": label,
                        "voice": voice_short_name,
                        "file": filename,
                    }
                )
                continue

            try:
                synthesize_to_file(
                    session=session,
                    voice=voice_short_name,
                    text=label,
                    output_file=target_path,
                    rate=rate,
                    pitch=pitch,
                )
                print(f"[ok] ({idx}/{total}) {glyph} ({label}) -> {filename}")
                manifest.append(
                    {
                        "glyph": glyph,
                        "audioLabel": label,
                        "voice": voice_short_name,
                        "file": filename,
                    }
                )
            except Exception as exc:
                print(f"[fail] ({idx}/{total}) {glyph} ({label}): {exc}")

            time.sleep(delay_seconds)

        manifest_path = voice_dir / "manifest.json"
        manifest_path.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        summary[voice_short_name] = {
            "output": str(voice_dir),
            "downloaded": str(len(manifest)),
            "manifest": str(manifest_path),
        }

    summary_path = output_root / "download-summary.json"
    summary_path.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\nDone. Summary saved to: {summary_path}")


def main() -> None:
    args = parse_args()

    if not args.curriculum.exists():
        raise FileNotFoundError(f"Curriculum file not found: {args.curriculum}")

    curriculum_items = parse_curriculum(args.curriculum)
    print(f"Parsed {len(curriculum_items)} unique glyphs from {args.curriculum}")

    session = requests.Session()
    kannada_voices = get_kannada_voices(session)
    selected_voices = select_voices(
        kannada_voices=kannada_voices,
        preferred_short_name=args.voice,
        all_kannada=args.all_kannada_voices,
    )
    print("Voices selected:", ", ".join(v[0] for v in selected_voices))

    download_all(
        curriculum_items=curriculum_items,
        voices=selected_voices,
        output_root=args.output,
        rate=args.rate,
        pitch=args.pitch,
        delay_seconds=args.delay,
        skip_existing=args.skip_existing,
    )


if __name__ == "__main__":
    main()