# Le Monde de Milo — Overall Design

**Status:** Working specification, 8 November 2026  
**Learner:** Six-year-old, almost no French comprehension  
**Goal:** Enjoyable, practical French comprehension and increasingly confident spoken communication.

## 1. Educational principles

Three complementary learning environments:

1. **Parent-led lessons:** Three approximately 30-minute sessions per week, using real objects, gestures, stories, role-play and spoken interaction. The parent teaches and evaluates speaking.
2. **Everyday reinforcement:** Brief natural exchanges at meals and during daily routines, without turning everything into a test.
3. **Independent iPad games:** Audio-first practice of listening comprehension, vocabulary, actions and retention. Games do not assess pronunciation.
4. **Illustrated audio stories:** Relaxed French listening in context, with no mandatory questions or quizzes. Stories reinforce the current and previous sessions.

Begin with recognition and following instructions; encourage imitation and then spontaneous speech without pressure. Introduce only a few expressions at a time, revisiting them frequently. Prioritise enjoyment and meaningful communication over scores.

## 2. Weekly structure and curriculum

Default rhythm: three 30-minute lessons (e.g., Monday, Wednesday, Friday), with optional 5–10-minute game sessions on other days. A lesson typically includes 5 minutes review, 10 minutes new language, 10 minutes interactive play and 5 minutes playful challenge; adapt to attention and interest.

**Default content rule:** One new main game **and one illustrated audio story** per week, linked to that week's three lessons. This is flexible: some chapters may have two short games or a larger multi-week adventure. Earlier games remain replayable, and new games revisit previous vocabulary.

| Week | Theme | Learning aim | Game concept | Story |
|---|---|---|---|---|
| 1 | Les découvertes | Food words; *montre-moi* and *donne-moi* | Le panier de Milo | Milo cherche sa pomme |
| 2 | J'ai faim ! | Hunger, thirst and yes/no | Milo a faim ! | Milo a faim ! |
| 3 | Je voudrais… | Requests and politeness | Le service du café | Milo prépare le goûter |
| 4 | Mon petit restaurant | Combine expressions in short exchanges | Le grand restaurant | Le restaurant de Milo |

This month-one sequence is a plan, not a mastery deadline. Slow down or repeat as needed.

## 3. Child-facing application

**Working title:** Le Monde de Milo. Milo is a friendly teddy bear who runs a café. The world grows with weekly chapters and new activities.

- **French only**, minimal written text; use spoken French, clear illustrations and intuitive touch controls. Reading French is not required for early games, although short French labels may accompany audio.
- Replay-audio button, large touch targets, gentle feedback and short replayable missions.
- No punitive failure, no progress gates based on speaking, no speech recognition in the initial scope.
- **No child-facing numerical scores, percentages, stars tied to accuracy or mistake counters.** Celebrate exploration, effort and completion rather than perfection; allow retries without penalties.
- Start with comprehension activities: selecting food, giving items, following instructions; later add puzzles, cooking, matching and role-play.
- Teach controls visually first, then fade visual hints so the learner must understand the spoken instruction.

### 3.1 Action understanding is a first-class learning objective

A correct food selection does **not** imply comprehension of the instruction. The app must distinguish the **object** (*pomme*, *banane*) from the **action** (*montre-moi*, *donne-moi*).

**Initial interaction hypothesis, to test with the child:**

- **« Montre-moi la pomme ! »** → **touch and hold** the apple briefly. The apple highlights but stays in place.
- **« Donne-moi la pomme ! »** → **drag** the apple to Milo, who receives it.

Use the same objects with both instructions, including mixed trials in the same activity, so neither the noun nor the screen layout alone gives away the answer. If she taps when a drag is required, offer a gentle prompt rather than immediately treating it as a language error. Observe whether touch-and-hold feels natural; change the control if playtesting reveals confusion. Distinguish motor-control errors from language errors where feasible.

### 3.2 Learning telemetry

For each attempt, capture only what is useful: chapter/activity, target phrase, target object, target action, selected object, performed action, whether help was shown, result, attempt number and approximate timestamp. Compute separately:

- **Object recognition:** correct object?
- **Action comprehension:** correct requested action?
- **Combined instruction:** both correct?

A successful assisted attempt should be distinguishable from unassisted comprehension. Avoid treating small numbers of attempts as proof of mastery.

### 3.3 Les Histoires de Milo — illustrated listening stories

A separate, **non-quiz** experience: approximately one new story per week, initially **5–8 illustrated static pages** and about **1–2 minutes** of French narration. Each page has an image, a short French caption (one or two sentences), and synchronised/prepared French voice-over. Allow child-controlled page turns, automatic playback, a replay-sentence button, and re-reading at any time. Avoid requiring French reading: illustrations and audio convey the story. Use a consistent Milo character, visual style and voice.

Stories reuse the **current and previous lessons' vocabulary**; a tentative target is 70–80% familiar language, but clarity and natural storytelling matter more than a rigid ratio. Any unfamiliar phrases should be inferable from illustrations and context. Stories can introduce a narrative problem that the week's game later resolves, but stories remain enjoyable independently. **Never require a quiz or correct answers to finish or replay a story.**

Track story opens, page views, completion and replays as **engagement signals only**, never as evidence of comprehension. A parent can casually discuss or act out a story during a lesson, without formal testing. For Week 1, introduce the first story after Lesson 2 by default.

Suggested data schema: `Story {id, week, title, vocabularyIds[], pages[]}`; `StoryPage {id, imageAsset, frenchText, audioAsset, optionalTiming}`. Use content-driven rendering, not hard-coded page logic. Audio can be generated TTS/prepared assets initially. Provide offline caching when feasible.

### 3.4 Progression without pressure

The child may strongly prefer replaying mastered content and avoiding possible mistakes. **Do not block familiar stories or games**: repetition supports confidence and retention. Instead, make the **next adventure prominent** on the home screen, give it a friendly Milo invitation, and start new games with familiar/easy interactions and demonstrations before introducing novelty. New stories should begin with familiar language and characters. Keep old content easily accessible.

For the MVP, implement three rules: (1) no visible numeric accuracy scores; (2) easy, guided opening to each new activity; (3) prominent, non-coercive next-adventure suggestion. Later, if useful, offer gentle invitations after repeated replay of mastered content, and show parents the balance of new versus familiar content. **Never equate replay preference with a diagnosis or automatically force progression.** Parent may introduce a new story together. Unlocking should not depend on perfect scores; align new content with parent sessions, with optional parent override.

## 4. Parent dashboard

The dashboard combines **automatically recorded iPad comprehension data** with **manual speaking assessments** from parent-led sessions.

**Game data:** activities played, time spent, completion, attempts, object accuracy, action accuracy, combined accuracy, review performance and repeated difficulties.

**Story and progression data:** stories opened/completed/replayed, pages revisited, and time or sessions spent on familiar versus new material. These are engagement indicators, not listening-comprehension scores. Surface a gentle suggestion for parent-supported exploration when appropriate.

**Manual session assessment:** for each word/expression, mark **says independently**, **says with prompting/repetition**, or **not yet**; optionally note understanding, pronunciation, engagement and spontaneous use. Keep spoken production and listening comprehension separate in reporting.

Use the results to suggest targeted review for the next lesson, not to label the child's ability based on a single mistake. The parent dashboard can be in English.

## 5. Proposed technical architecture (not yet finalised)

- **Platform:** iPad-friendly Progressive Web App (PWA), installable from Safari; parent dashboard accessible on phone or computer.
- **Frontend:** React + TypeScript, with modular weekly game components and a shared lesson/vocabulary content schema.
- **Backend candidate:** Supabase (or equivalent) for protected progress storage and parent authentication.
- **Sync:** offline-capable local event queue with sync when connected; design for duplicate-safe event ingestion.
- **Audio:** good-quality French text-to-speech or prepared audio assets initially. Parent-recorded phrases are a possible later improvement.
- **Privacy:** no child voice recordings needed; use a pseudonymous child profile, parent-only dashboard access, minimal data, and secure access controls.

These are implementation proposals rather than settled technology commitments; validate choices during the Codex build.

## 6. MVP and expansion

**Week 1 MVP:** Milo character and food illustrations; French audio and replay; three linked activities; touch-and-hold versus drag-to-Milo; object/action telemetry; **first illustrated narrated story (5–8 pages), story player and basic engagement telemetry**; non-scored child UI; gentle next-adventure promotion; saved progress; a minimal parent dashboard with manual speaking notes.

**Next:** add Weeks 2–4 modules, cumulative review and more varied interactions. Later: adaptive review, more stories and optional richer audio. Do not make speech recognition a dependency.

## 7. Success criteria and playtesting

- She wants to play and enjoys the parent sessions.
- She increasingly recognises familiar French words and **understands the requested action**.
- She retains language across days and weeks.
- She gradually produces words and short phrases with the parent.
- French begins appearing naturally at home.

**First usability test:** Watch her try touch-and-hold for *montre-moi* and drag-to-Milo for *donne-moi*. Are the controls obvious after demonstration? Can she switch between actions when the same object is used? Does she confuse the gesture with the language? Adjust based on observation.

## 8. Agreed versus provisional decisions

**Agreed:** one weekly illustrated narrated story, no story quizzes, cumulative story language, replay always allowed, no child-facing accuracy scores, gentle progression; beginner level; food first; three parent-led sessions/week; home reinforcement; one expandable main game/week by default; child app French-only/minimal text; listening-focused iPad practice; parent evaluates speech; separate dashboard metrics; no initial speech recognition; test action comprehension explicitly.

**Provisional / to validate:** touch-and-hold interaction; exact unlocking scheme; PWA/React/Supabase stack; TTS voice choice; specific scoring and adaptive algorithms; detailed artwork and rewards.
