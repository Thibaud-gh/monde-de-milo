#!/usr/bin/env python3
"""Prepare offline neural-voice clips, matching FrenchKid's no-account workflow.

Install: python3 -m pip install edge-tts
Preview: python3 scripts/generate-audio.py --sample
Generate all: python3 scripts/generate-audio.py
Existing matching clips are cached. --force deliberately regenerates them.
"""
import argparse
import asyncio
import hashlib
import json
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'public' / 'audio'
PHRASES = json.loads((AUDIO / 'phrases.json').read_text())
VOICE = 'fr-FR-EloiseNeural'
RATE = '-10%'

async def generate(args):
    selected = {'bonjour': PHRASES['bonjour']} if args.sample else PHRASES
    catalog_path = AUDIO / 'catalog.json'
    catalog = json.loads(catalog_path.read_text()) if catalog_path.exists() else {'provider': 'edge-tts', 'clips': {}}
    for name, text in selected.items():
        signature = hashlib.sha256(json.dumps([text, args.voice, RATE], ensure_ascii=False).encode()).hexdigest()
        target = AUDIO / f'{name}.mp3'
        existing = catalog.get('clips', {}).get(name, {})
        if not args.force and existing.get('signature') == signature and target.exists() and target.stat().st_size > 1000:
            print(f'Cached: {name}')
            continue
        temporary = AUDIO / f'{name}.tmp.mp3'
        try:
            await edge_tts.Communicate(text, args.voice, rate=RATE).save(str(temporary))
            if temporary.stat().st_size < 1000:
                raise RuntimeError(f'Empty audio for {name}')
            temporary.replace(target)
        finally:
            temporary.unlink(missing_ok=True)
        catalog.setdefault('clips', {})[name] = {'file': f'{name}.mp3', 'text': text, 'voice': args.voice, 'rate': RATE, 'signature': signature}
        catalog['provider'] = 'edge-tts'
        catalog_path.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + '\n')
        print(f'Generated: {name} ({args.voice})')
    print(f'{len(selected)} clips ready. Rebuild with npm run ios:sync to bundle them for iPad.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--voice', default=VOICE)
    parser.add_argument('--sample', action='store_true')
    parser.add_argument('--force', action='store_true')
    asyncio.run(generate(parser.parse_args()))
