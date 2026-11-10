# Milestone 1 verification — 8 November 2026

- `npm test`: 14 passing tests cover separate object/action evidence, tap-to-show, incomplete gestures, guidance exclusion, balanced trials, event merging and all 25 prepared MP3s. Named and unnamed story captions match their recordings.
- `npm run ios:sync`, TypeScript/Vite production build and Xcode simulator build pass. Updated app installed over the existing app, preserving progress.
- iPad Pro 11-inch (M5), iOS 26.2: a quick tap on the apple earns “Oui, bravo !”; dragging it to Milo earns “Merci !” and puts it in his hand. No hold timer consumes the start of a drag. Release displacement still handles coalesced move events.
- Unfinished gestures now return silently: off-target drags and taps during give prompts do not record an attempt, trigger retry audio, change hints or advance the trial. Historical motor observations remain intact.
- Chapter selection opens three separately numbered game cards and one story. All four choices fit on iPad landscape. Narrow browser layout uses stacked choices. Upcoming chapters are labelled and disabled.
- All six story pages reviewed: missing apple, water on table, banana on shelf, covered basket, apple revealed inside basket, farewell to Éva while Milo holds the apple. Locations remain consistent. Narration regenerated with Éloïse, and audio URLs are versioned to prevent stale cached clips.
- In-app parent signup, confirmation instructions, resend confirmation and sign-in screens implemented. First name is saved with account metadata and copied into the owner-protected learner profile. Other names use unnamed recordings until named audio is prepared.
- Supabase project `zjsrxwsgrbkocovrtbuh` (Ireland): schema installed successfully; both tables have explicit grants and RLS ownership policies. Live unauthenticated reads returned HTTP 401/permission denied for both tables. Email signup is enabled and email confirmation remains required. Exact hosted/local confirmation callbacks configured.
- Project URL and publishable key configured in ignored local environment and GitHub Actions variables. No database password or service-role key is used.

## Remaining user checks

- Create a real parent account in the app, confirm email and sign in on the simulator and dashboard. Authenticated cross-device sync and two-account isolation still need live verification; anonymous denial alone does not establish those.
- Physical iPad signing with a free Personal Team, seven-day rebuild/install and child playtesting.

Simulator and local browser observations from development review are preserved; these are not child learning evidence. Supabase content is private to signed-in owners; the app interface and repository remain public.

## Whole-utterance Éva narration — 9 November 2026

- Generated 21 fresh `eva-` MP3 clips with one complete utterance per request. Greeting, instructions, hints, feedback and story all select from this pack; no name concatenation is used.
- Verified all 21 unnamed clips against their committed bytes: unchanged. Other learner names select those clips; Eva and Éva select the named pack.
- All 21 new files decode with ffprobe; their content hashes and transcripts match the catalog. File hashes version playback URLs even when text stays the same.
- Game feedback advances only after the audio finishes (and the minimum visual delay), preventing names from being cut off by the old 1.1/1.3-second timers.
- 15 tests pass, including pack selection and caption consistency for both named and unnamed users. Native assets are refreshed using the existing simulator build, without rebuilding the native shell or running UI automation. Subjective voice quality still needs listening review.

## Playtest refinements — 9 November 2026

- Éva appears in the welcome and goodbye only; routine prompts, feedback and hints use the preserved unnamed clips. All full-sentence named recordings are retained.
- All three games display all four foods. Find: eight show prompts (two per food). Give: eight give prompts (two per food). Mission: one show and one give prompt for each food. Only the first turn is automatically guided. Hand demos run once, including replayed help.
- Voice playback exposes a start event; input becomes active when playback starts. Browser review confirmed a correct tap accepted during the spoken prompt. Stale audio callbacks cannot activate a later prompt. Off-target drags still return silently.
- Original 64-second menu music generated without external samples. Mute persists; music ducks under speech and fades/pauses for games, story, parent area and background visibility. Browser mute/unmute controls checked.
- 23 unit tests cover trial balance, one guided turn, name frequency, early audio readiness, stale callbacks, menu music lifecycle and existing progress logic. TypeScript/Vite build passes. Physical iPad update preserves the installed app’s records and parent session.

## Session 2 and sequential games — 9 November 2026

- 28 unit tests pass, including new progression tests for prerequisites, one-time introductions, repeatable practice, legacy completion IDs, chapter isolation and checkpoint resume after delayed sync. TypeScript/Vite production build passes.
- Browser QA used an isolated local origin with Supabase disabled, so test speaking observations were not uploaded to the family account. Completed all three new games, checked that interrupted Game 1 resumed at turn two, and verified that Games 1/2 closed after completion and Game 3 offered Replay. “Not this time” also advances, with no mastery gate.
- Reviewed all six parent-read story pages and its ending. Verified parent guide renders all seven timed sections, exact French parent/Milo prompts, support ladder, complete story script and print control. Screenshots saved locally under /private/tmp.
- Chapter 2 is parent-led, without new audio. Existing MP3 assets are unchanged. Remote TTS instructions are preserved; all generation remains paused pending the replacement model.
- Parent-reported speech evidence is saved as assessments, separately from automatic Chapter 1 gesture metrics. A model or starter cannot be labelled independent by the game controls.
- Checkpoints and chapter-qualified engagement IDs fit the existing JSON event schema; no Supabase schema or access-policy changes were made. Authenticated cross-device verification still requires the signed-in devices.

## One square per game — 9 November 2026

- Session 1 now has two squares: one understanding game and its story. Session 2 has three: understanding, the existing parent-speaking activity, and the story. Each game opens its current stage rather than exposing three separate game cards.
- Game stages advance independently, 1 → 2 → 3. Stages 1/2 remain one-time introductions with checkpoint resume; Stage 3 remains replayable. Legacy Chapter 1 completion IDs and Chapter 2 speaking IDs are preserved. New Chapter 2 understanding events have distinct IDs.
- Session 2 understanding uses the existing tap/drag game engine with new “Je voudrais…” requests. No speech response, microphone or parent speech-rating controls appear in that game. Until TTS is resumed, the adult reads the displayed request. No unrelated old clip is substituted for the new text.
- 31 tests pass, covering independent game progression, legacy checkpoint isolation, and the new understanding transcripts in addition to existing gesture/audio checks. Browser review completed both understanding introductions via equivalent keyboard controls, verified the same square changed to Stage 2 then Stage 3, and confirmed old speaking progress remained at Stage 3.
- Reviewed the two-square Session 1 layout and the three-square Session 2 layout at desktop and iPad portrait sizes. Temporary viewport override was reset. All browser test records stayed on the isolated, Supabase-disabled preview origin.
- Updated the printable parent plan to distinguish understanding from parent-led speaking. Existing prepared audio remains unchanged; all new TTS generation remains paused.

## Original activity cards and stage stars — 9 November 2026

- Clarified layout: reuse the original three activity cards for Understanding / Speaking with parent / Story; keep each game’s stages inside its own card. Session 1 retains two cards. Removed the interim square-cover styling.
- Each game shows three SVG stars. Stage completion fills that stage’s star, including Stage 3. Replay completions do not add extra stars, and existing history fills the corresponding stars automatically.
- 32 tests pass. Added a progression test for zero, one, two and three earned stars, replay deduplication, track isolation and staying at Stage 3. Browser review showed two stars for understanding and three for speaking on the original three-card row. Test data remained isolated from Supabase.
- The full Session 2 programme remains available under Parents → Session 2 · Lesson plan (with Print), and in docs/session-2.md. All new TTS remains paused.

## Fully screen-free parent lesson — 10 November 2026

- Replaced iPad activities in the parent lesson with real-object review, a teddy demonstration, silly wrong orders, a pretend café, an acted-out story and one final request. The 25-minute programme needs only the bear, food props, a glass, a tray and a cloth. App games remain separate optional activities.
- Updated the dashboard guide and Markdown script, including exact parent/Milo lines, expected child turns and support. Post-session notes can be written on paper; no app stages or digital scores are required by the lesson.
- Created a two-page printable PDF, rendered and visually reviewed both pages. Verified all six timings, the story, French accents and request phrases; no iPad step remains in the printout. A copy is bundled under public/guides for download from the parent guide.
- Production TypeScript/Vite build passes. No new game logic, audio generation or device installation was needed for this content change.
