# Milestone 1 verification — 8 November 2026

- `npm test`: 14 passing tests cover separate object/action evidence, tap-to-show, incomplete gestures, guidance exclusion, balanced trials, event merging and all 25 prepared MP3s. Named and unnamed story captions match their recordings.
- `npm run ios:sync`, TypeScript/Vite production build and Xcode simulator build pass. Updated app installed over the existing app, preserving progress.
- iPad Pro 11-inch (M5), iOS 26.2: a quick tap on the apple earns “Oui, bravo !”; dragging it to Milo earns “Merci !” and puts it in his hand. No hold timer consumes the start of a drag. Release displacement still handles coalesced move events.
- Chapter selection opens three separately numbered game cards and one story. All four choices fit on iPad landscape. Narrow browser layout uses stacked choices. Upcoming chapters are labelled and disabled.
- All six story pages reviewed: missing apple, water on table, banana on shelf, covered basket, apple revealed inside basket, farewell to Éva while Milo holds the apple. Locations remain consistent. Narration regenerated with Éloïse, and audio URLs are versioned to prevent stale cached clips.
- In-app parent signup, confirmation instructions, resend confirmation and sign-in screens implemented. First name is saved with account metadata and copied into the owner-protected learner profile. Other names use unnamed recordings until named audio is prepared.
- Supabase project `zjsrxwsgrbkocovrtbuh` (Ireland): schema installed successfully; both tables have explicit grants and RLS ownership policies. Live unauthenticated reads returned HTTP 401/permission denied for both tables. Email signup is enabled and email confirmation remains required. Exact hosted/local confirmation callbacks configured.
- Project URL and publishable key configured in ignored local environment and GitHub Actions variables. No database password or service-role key is used.

## Remaining user checks

- Create a real parent account in the app, confirm email and sign in on the simulator and dashboard. Authenticated cross-device sync and two-account isolation still need live verification; anonymous denial alone does not establish those.
- Physical iPad signing with a free Personal Team, seven-day rebuild/install and child playtesting.

Simulator and local browser observations from development review are preserved; these are not child learning evidence. Supabase content is private to signed-in owners; the app interface and repository remain public.
