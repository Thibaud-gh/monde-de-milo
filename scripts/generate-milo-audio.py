#!/usr/bin/env python3
"""Stage offline MP3s through the user's installed Milo voice helper.

No model/environment setup on the Mac. Runs one helper job at a time, keeps
raw WAVs, resumes successful jobs by exact transcript, and deduplicates identical
whole utterances. Output is staged: it never overwrites public/audio itself.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import time

VOICE = {
    'name': 'Milo — On compte', 'model': 'openbmb/VoxCPM2',
    'revision': '7936080b41163874f38610f46f438e2c0757f9fd',
    'referenceSha256': '4a32b269d96766276246d3240917f59f916602ceaa9f4146da7ba5cd552e6e3e',
    'seed': 42, 'cfg_value': 2.0, 'inference_timesteps': 20,
}

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def save(path, value):
    temporary = path.with_suffix('.tmp.json')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)

def inspect(path):
    info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)], text=True))
    streams = info.get('streams', [])
    if len(streams) != 1 or streams[0]['codec_type'] != 'audio':
        raise ValueError(f'Expected one audio stream: {path}')
    stream = streams[0]
    seconds = float(info['format']['duration'])
    if not .1 < seconds < 40 or int(stream['sample_rate']) != 48000 or stream['channels'] != 1:
        raise ValueError(f'Unexpected audio format/duration: {path}')
    return seconds

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--corpus', type=Path, default=Path('public/audio/phrases.json'))
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--helper', type=Path, default=Path.home() / 'bin/milo')
    parser.add_argument('--seed-cache', type=Path, help='Local JSON mapping exact text to an already generated WAV')
    args = parser.parse_args()
    helper = args.helper.expanduser().resolve()
    if not helper.is_file():
        raise FileNotFoundError('Install the user-supplied Milo helper first.')
    phrases = json.loads(args.corpus.read_text())
    if not phrases or any(not re.fullmatch(r'[A-Za-z0-9-]+', key) or not isinstance(value, str) or not value.strip() for key, value in phrases.items()):
        raise ValueError('Corpus must map safe clip IDs to nonempty text.')
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    state_path = output / 'jobs.json'
    jobs = json.loads(state_path.read_text()) if state_path.exists() else {}
    seeds = json.loads(args.seed_cache.read_text()) if args.seed_cache else {}
    catalog = {'provider': 'voxcpm2', 'voice': VOICE, 'clips': {}}
    unique = list(dict.fromkeys(phrases.values()))
    print(f'{len(phrases)} clip IDs / {len(unique)} whole utterances; generating sequentially.', flush=True)
    for index, text in enumerate(unique, 1):
        signature = hashlib.sha256(json.dumps([text, VOICE], ensure_ascii=False, sort_keys=True).encode()).hexdigest()
        job = jobs.get(signature, {})
        wav = Path(job.get('wav', seeds.get(text, ''))) if job.get('wav') or seeds.get(text) else None
        if wav is None or not wav.is_file():
            job_dir = output / 'wav' / signature[:16]
            job_dir.mkdir(parents=True, exist_ok=True)
            before = set(job_dir.glob('*.wav'))
            print(f'[{index}/{len(unique)}] {text}', flush=True)
            started = time.monotonic()
            with (job_dir / 'generate.log').open('a') as log:
                result = subprocess.run([str(helper), text, str(job_dir)], stdout=log, stderr=subprocess.STDOUT)
            if result.returncode:
                raise RuntimeError(f'Milo job failed; see {job_dir / "generate.log"}. Completed jobs are preserved.')
            generated = set(job_dir.glob('*.wav')) - before
            if len(generated) != 1:
                raise RuntimeError(f'Expected one new WAV in {job_dir}')
            wav = generated.pop()
            elapsed = round(time.monotonic() - started, 2)
        else:
            elapsed = job.get('generationSeconds')
            print(f'[{index}/{len(unique)}] Cached: {text}', flush=True)
        seconds = inspect(wav)
        jobs[signature] = {'text': text, 'wav': str(wav), 'wavSha256': digest(wav), 'seconds': seconds, 'generationSeconds': elapsed}
        save(state_path, jobs)
        encoded = output / (signature + '.mp3')
        if not encoded.exists():
            subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav), '-map_metadata', '-1', '-codec:a', 'libmp3lame', '-b:a', '128k', '-ar', '48000', '-ac', '1', str(encoded)], check=True)
        inspect(encoded)
        encoded_hash = digest(encoded)
        for clip_id, phrase in phrases.items():
            if phrase != text:
                continue
            target = output / f'{clip_id}.mp3'
            shutil.copyfile(encoded, target)
            catalog['clips'][clip_id] = {'file': target.name, 'text': text, 'voice': VOICE['name'], 'model': VOICE['model'], 'rate': 'reference', 'signature': signature, 'contentHash': encoded_hash, 'sourceWavHash': digest(wav), 'durationSeconds': round(seconds, 3), 'generation': 'whole-utterance'}
        save(output / 'catalog.json', catalog)
        print(f'  Ready: {seconds:.2f}s' + (f' (job {elapsed}s)' if elapsed else ''), flush=True)
    save(output / 'phrases.json', phrases)
    print(f'Complete: {len(phrases)} staged clips in {output}', flush=True)

if __name__ == '__main__':
    main()
