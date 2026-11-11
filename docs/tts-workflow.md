# French voice workflow

**10 November 2026: the parent resumed TTS using the newly selected Milo voice, requesting a complete Session 1 regeneration and Session 2 audio.** The screen-free parent lesson remains screen-free.

## Current voice

- Approved synthetic voice: **Milo - On compte**, using its fixed reference audio and exact transcript, never a fresh design.
- Model: `openbmb/VoxCPM2`, pinned revision `7936080b41163874f38610f46f438e2c0757f9fd`.
- Reference SHA256: `4a32b269d96766276246d3240917f59f916602ceaa9f4146da7ba5cd552e6e3e`.
- Settings: reference continuation, seed 42, CFG 2, 20 steps, maximum length 250. No denoiser, automatic retries or compilation. Output uses the approved whole-clip gain adjustment, 48 kHz mono PCM16 WAV.
- GPU generation uses the supplied isolated environment and checks at least 9 GiB free VRAM. The user has now authorised the documented borrowing/restoration workflow; read the current private guide before doing so, record whether the assistant was running, and restore it only if we stopped it. The revised Session 2 batch finished on CPU with two threads and did not stop the assistant. The guide location is saved in ignored local notes.

The parent's Mac helper is installed at `~/bin/milo`. It takes exactly the French text and a local output directory. Connection, environment, reference files, raw generation records, and the separate batch entry point remain in ignored local build notes and the remote project. Infrastructure details are excluded from this public repository.

The original helper reloads the model for every call. A separate batch entry point reuses one loaded model and one prompt cache with the same pinned reference, generation settings, output guards and per-text seeds. The existing helper and reference are unchanged.

## App assets

- `public/audio/phrases.json` has 98 clip IDs, covering the original 63 unique whole utterances plus 30 new recordings. Identical transcripts may reuse an entire recording. Names are never spliced.
- All 46 previous Session 1 clips were regenerated, retaining both generic and Éva variants. The previous MP3s, captions and catalog are backed up locally.
- The revised Session 2 adds 12 complete has/wants contrasts, two new-word introductions, six “J’ai” models, two new request models, a question and starter, and six story pages with the cheese-hat twist. Previous Session 2 clips are retained. Understanding remains touch-only; speaking remains parent-led.
- Raw WAVs and their provenance records stay local / on the generation machine. App MP3s are encoded at 128 kbps with no extra rate or loudness processing. Catalog hashes version playback URLs.
- `scripts/generate-milo-audio.py` stages a corpus through the installed helper or a validated local WAV cache. It resumes completed utterances and never writes to `public/audio` itself. Review and promote the staged assets only after checks pass.

The older Edge and Qwen workflows remain available for reference. Do not accidentally overwrite the selected Milo voice with those providers.
