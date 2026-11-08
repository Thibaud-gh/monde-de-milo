# Le monde de Milo

A picture-book café for a six-year-old beginning French. The child explores **chapters**, each containing its **games and illustrated audio story**. Chapter 1 is playable. Chapters 2–4 are clearly labelled previews, not mastery gates.

React + TypeScript + Vite, packaged for iPad with Capacitor. The English parent dashboard runs in the same project at `#/parent`; the child app never displays accuracy scores. Supabase optionally connects the iPad and web dashboard. Without configuration, each device has its own local records, with no fake sample progress.

## Run locally

Node 22.12+ (Node 24 recommended), npm, and Xcode 26+ for iOS.

```sh
npm ci
npm run dev
```

Open the printed localhost URL. Use **Parents** to enter the parent area; the arithmetic challenge prevents accidental entry and is not a security boundary. When cloud configuration is present, parent records also require Supabase authentication.

```sh
npm test
npm run build
npm run ios:sync
npm run ios:open
```

The native project is `ios/App/App.xcodeproj`, scheme **App**. There is no dependency on paid Expo/cloud build services. Native plugin dependencies use Swift Package Manager.

## Free Apple account / your physical iPad

1. Open the native project in Xcode. In **Xcode → Settings → Accounts**, add your Apple account yourself.
2. Select the **App** target, **Signing & Capabilities**, enable automatic signing and select your **Personal Team**. If necessary, choose your own unique bundle identifier.
3. Connect the iPad, trust the Mac, and enable Developer Mode on the iPad if prompted.
4. Select the iPad as the destination and press Run.
5. After the seven-day provisioning expires, reconnect and Run again. **Keep the existing app installed:** installing a new build over it normally preserves its data. Deleting the app erases local, unsynced records. Cloud-synced records can be downloaded after signing in again.

Simulator builds need no signing account. To launch the installed iPad simulator from the CLI:

```sh
npm run ios:run
```

Progress uses Capacitor Preferences on iOS and localStorage in the browser. Export a copy from the parent dashboard before deleting the app or changing devices. The JSON export is a portable record copy; this milestone does not yet provide a restore/import screen.

## Connect Supabase (free plan)

The Supabase **project owner account** and your **app parent login** are separate things. Your child does not need either account.

1. Create a free project at <https://supabase.com/dashboard>. Choose an appropriate nearby region and retain the database password privately.
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql) once on this **new project**. It creates the protected tables, grants and row-level security policies. Do not put real child names or other identifying information into the sample nickname.
3. In **Authentication → Users**, use **Add user → Create new user** to create your parent login with an email and password; confirm the email there for this personal prototype. You enter that password yourself. Keep public signups disabled if you only need this family account.
4. Find the **project URL** and **publishable key** in the project's connect/API settings. Copy `.env.example` to `.env.local` and fill only those two public client values:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   ```

   Never use a database password, secret key or `service_role` key in frontend configuration. The publishable key is deliberately public; row-level security enforces ownership.
5. Restart Vite. Sign in through the parent dashboard on your computer. Rebuild and sync the iOS project, install the new build, and sign in to the **same app parent login** through Parents on the iPad.
6. The first login associates that device's existing local observations with this parent. This first milestone supports **one learner per parent**, not multiple children or two separate parent accounts sharing one learner. A device already associated with another account will refuse to upload into a different account.
7. Play an activity on the iPad and press **Sync now** in the web dashboard. The dashboard also refreshes from Supabase every 30 seconds while open. Uploads happen after events, login and reconnect. The latest parent-lesson selection syncs between devices too.

Events receive a stable UUID before upload. Duplicate uploads cannot create duplicates. The app marks an event uploaded only after Supabase confirms the write; failed uploads stay queued. History reads are paginated. No child microphone permission, voice recording, or speech recognition is used.

Free Supabase projects may pause after a week of low activity. Play remains local; sync resumes once you restore the project. Online sync and access policies require an actual configured project to verify end-to-end; the local prototype cannot establish that for an account that has not been created yet.

## GitHub Pages

1. Put this project in your chosen GitHub repository. GitHub Free requires a **public repository** for Pages; never commit `.env.local` or record exports.
2. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. In **Settings → Secrets and variables → Actions → Variables**, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the same public client configuration used locally.
4. Push to `main`, or run the supplied **Publish dashboard and web app** workflow manually.
5. The dashboard will be at `https://YOUR_NAME.github.io/YOUR_REPO/#/parent`.

The static site contains the interface and bundled illustrations/audio. Family records remain in Supabase and require a parent login. GitHub Pages does not host the database. Changing repository variables requires a new build. Relative asset paths support both root domains and GitHub Pages project subpaths.

The repository and Supabase project belong in your accounts. Supabase credentials are configured independently of website publication.

## What's included

- Chapter home and per-chapter game/story view; 3 playable Chapter 1 activities.
- 650 ms touch-and-hold to show, pointer drag to give, generous drop tolerance.
- Identical food layout for show/give within an activity; independent random layout and balanced mixed trials.
- Guided opening, audio replay, fading visual help and forgiving retries. Help stays attached to the whole trial so a successful guided retry is never reported as independent.
- Six static illustrated story pages, prepared French narration, manual page turns, optional autoplay and replay, with no quiz.
- Separate object/action/combined ratios, guided attempts, motor slips, story engagement and manual speaking observations.
- Local progress, optional duplicate-safe cloud sync, parent-lesson setting, JSON export.
- Locally bundled Delius and Nunito fonts and 21 prepared French neural-voice MP3 clips. Milo uses `fr-FR-EloiseNeural` at a slightly slower pace, matching FrenchKid’s original no-account workflow. Playback never falls back to a system voice. See the audio preparation instructions below.

The web build is currently a browser app, not an offline-installable PWA: native iOS bundles its content for offline use. A service worker and web install manifest can be added separately. Touch-and-hold still needs playtesting with your child; simulator/mouse tests do not establish that the gesture is comfortable for a six-year-old.

See [the original design](01_Le_Monde_de_Milo_Design.md), [Week 1 content](Milo_Week1.md) and [visual direction and references](docs/visual-direction.md).

## Prepare the French voice clips

FrenchKid used Microsoft Edge neural voices through `edge-tts`: Éloïse for Rosie, Denise for the narrator. Milo currently uses **Éloïse consistently** for greetings, instructions and the six first-person story pages. These are generated files, not live synthesis and not recordings of your child. No speech account or API key is required for this preparation workflow.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r scripts/audio-requirements.txt
.venv/bin/python scripts/generate-audio.py --sample
.venv/bin/python scripts/generate-audio.py
npm run ios:sync
```

Version 7.3.1 is pinned because the older 7.2.7 installed with FrenchKid could no longer connect after the service changed. Generation requires internet; playback does not. The transcript is `public/audio/phrases.json`; `catalog.json` records each file’s voice and rate. Existing matching clips are cached. Use `--force` only to deliberately regenerate. To try Denise, use `--voice fr-FR-DeniseNeural --sample`; rebuild after choosing a voice.

A human recording can replace any corresponding MP3 file under the same stable ID. Maintain the transcript and catalog alongside it. The app does not contain or need an ElevenLabs key.
