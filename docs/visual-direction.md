# Milo's picture-book café

## References and decisions

- Apple, [Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games/): teach by playing; make touch direct and forgiving. Controls are at least 52 CSS pixels here; food targets are substantially larger.
- Google, [Designing engaging apps for kids](https://developers.google.com/building-for-kids/designing-engaging-apps): support non-readers, familiar navigation icons, simple gestures, useful visual feedback, and a separate adult area.
- Pok Pok, [design philosophy in its FAQs](https://playpokpok.com/faqs/): calm pacing, tactile illustration and child-led replay. We borrow restraint, not its artwork or exact interface.
- Duolingo, [shape language](https://blog.duolingo.com/shape-language-duolingos-art-style/): consistent shape vocabulary and instantly readable silhouettes. Foods must look like the words they teach.

## Art direction

An illustrated neighbourhood café, like a picture book made from cut paper. Milo is an original biscuit-coloured bear with a short muzzle, small ears, rosy cheeks and an ink-blue apron with a yellow pocket. Keep that model in games, stories, and navigation. No stock emoji as teaching illustrations. Author vector assets so poses, food silhouettes and narrative continuity stay consistent.

Palette: butter #F8D767, window blue #CCE5EA, ink #263B59, strawberry #D9534F, paper #FFF9ED, biscuit #C18B58. Blue and yellow carry the interface; red belongs mainly to apples and small accents. Use hard-edged layered paper shapes, subtle offset shadows, scalloped awning and gingham tablecloth. Avoid gradient washes and shiny 3D.

Type: a friendly handwritten display face (Delius), with Nunito for controls and parent reading. Bundle fonts locally for offline use. Left-align parent content; centre only short child invitations and story captions.

Home composition:

    [small brand]                           [grown-ups]
                 Le monde de Milo
         [café awning / large illustrated Milo]
                  [next adventure]
          [basket / play]       [book / stories]

Game composition:

    [home]          [spoken prompt / replay]       [help]
                    Milo, at the café
             food   food   food   food
                generous gingham table

The whole café is the memorable element. Do not make the child screen a dashboard of lesson cards. The parent dashboard uses the same ink and blue but a quieter notebook layout, tables and concise observations; no invented sample progress.

## Review against the brief

A generic warm-cream/serif/terracotta proposal would look like an adult lifestyle landing page. Revised to blue/yellow, handwritten type, custom character and one continuous illustrated scene. Small ornamental details stay outside the interactive food area. Keep object positions independent of the requested action. Gesture demonstrations are temporary assistance, never permanent answer cues. No score, streak, accuracy reward, or compulsory quiz appears in the child app.

## Playtest questions

Does tapping feel natural? Can she switch between tapping and dragging the same food without a layout clue? Can she identify every food without reading? Can she find audio replay independently? Parent observations must distinguish gesture confusion from language understanding.

## Feedback applied during the first build

The home is a series of chapters. Opening a chapter shows its game activities and its story together. Chapter 1 is available; later chapters are explicitly marked as upcoming content, independent of accuracy. Navigation from games and stories returns to their chapter.

Voice direction: prepared French neural clips matching the existing FrenchKid workflow (`fr-FR-EloiseNeural`), not Mac voices. No runtime speech-synthesis fallback. Reusable local assets keep the same voice offline and make future human recordings straightforward to substitute.
