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
