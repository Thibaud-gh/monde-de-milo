# Milestone 1 local verification — 8 November 2026

- `npm test`: 12 passing tests. They check separate noun/action evidence, motor-slip exclusion, assisted vs independent ratios, balanced mixed trials, duplicate-safe merges, transcript consistency, and that all 21 MP3 assets exist and are nonempty.
- `npm run ios:sync`: TypeScript and Vite production build pass; native plugin/assets sync passes.
- Xcode 26.2, App scheme, iPad Pro 11-inch (M5), iOS 26.2 runtime: simulator build, installation and launch pass without code signing.
- Simulator: touch-and-hold on the apple produces `show / correct`; dragging the apple to Milo produces `give / correct` and visibly puts the apple in Milo's hand. A short tap produces `tap / motor`, with action comprehension unknown rather than incorrect.
- A drag with coalesced move events originally registered as a tap. The release displacement now also determines a drag; the simulator retest passes.
- Native Preferences still contain the earlier observations after a rebuild/install/relaunch.
- The chapter overview contains its own three games and story. Back navigation returns to the chapter; the home presents four chapter entries with only Chapter 1 currently available.
- Story autoplay visits all six pages, ends on “Au revoir, Milo !”, and offers replay. Landscape and portrait layouts inspected. Story events stay separate from comprehension metrics.
- Parent dashboard and speaking form inspected in the browser. No artificial child assessment was entered. Browser game interactions recorded during review are local development observations.
- All 21 Éloïse neural MP3s decode successfully with ffprobe, totalling 56.4 seconds across game prompts, feedback and story lines. There is no runtime system-TTS fallback.

## Still requires the user's accounts or real-device playtesting

- Supabase project creation, schema execution and parent login. No real cloud account has been configured; cross-device syncing and live RLS isolation have not been exercised against a hosted database.
- GitHub repository / Pages configuration. A deploy workflow is provided; nothing is published yet.
- Physical iPad signing with a free Personal Team and a subsequent seven-day reinstall.
- Playtesting with the child, especially whether the hold gesture feels natural and whether gesture confusion is distinguishable from language uncertainty.

The simulator's development observations are cleared before the final handoff. Browser preview observations remain for the ongoing user review.
