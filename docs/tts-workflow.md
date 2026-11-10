# French voice workflow

**10 November 2026: the parent resumed TTS using the newly selected Milo voice, requesting a complete Session 1 regeneration and Session 2 audio.** The screen-free parent lesson remains screen-free.

## Current voice

- Approved synthetic voice: **Milo - On compte**, using its fixed reference audio and exact transcript, never a fresh design.
- Model: `openbmb/VoxCPM2`, pinned revision `7936080b41163874f38610f46f438e2c0757f9fd`.
- Reference SHA256: `4a32b269d96766276246d3240917f59f916602ceaa9f4146da7ba5cd552e6e3e`.
- Settings: reference continuation, seed 42, CFG 2, 20 steps, maximum length 250. No denoiser, automatic retries or compilation. Output uses the approved whole-clip gain adjustment, 48 kHz mono PCM16 WAV.
- GPU generation uses the supplied isolated environment, checks at least 9 GiB free VRAM and never stops or reconfigures the live assistant.

The parent's Mac helper is installed at `~/bin/milo`. It takes exactly the French text and a local output directory. Connection, environment, reference files, raw generation records, and the separate batch entry point remain in ignored local build notes and the remote project. Infrastructure details are excluded from this public repository.

The original helper reloads the model for every call. A separate batch entry point reuses one loaded model and one prompt cache with the same pinned reference, generation settings, output guards and per-text seeds. The existing helper and reference are unchanged.

## App assets

- `public/audio/phrases.json` has 68 clip IDs, covering 63 unique whole utterances. Identical transcripts may reuse an entire recording. Names are never spliced.
- All 46 previous Session 1 clips were regenerated, retaining both generic and Éva variants. The previous MP3s, captions and catalog are backed up locally.
- Session 2 adds eight understanding instructions, four full request models, six story pages, a question, starter, reply and ending. Understanding remains touch-only; speaking remains parent-led.
- Raw WAVs and their provenance records stay local / on the generation machine. App MP3s are encoded at 128 kbps with no extra rate or loudness processing. Catalog hashes version playback URLs.
- `scripts/generate-milo-audio.py` stages a corpus through the installed helper or a validated local WAV cache. It resumes completed utterances and never writes to `public/audio` itself. Review and promote the staged assets only after checks pass.

The older Edge and Qwen workflows remain available for reference. Do not accidentally overwrite the selected Milo voice with those providers.
