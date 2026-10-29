# Fiszkb

**Flashcards, spaced repetition, local practice and a dungeon powered by studying.**

**[Use Fiszkb at fiszkb.pages.dev](https://fiszkb.pages.dev)** · **[Source on GitHub](https://github.com/emenesik/Fiszkb)** · Version **1.10.13** · English / Polish

Fiszkb is a browser app for building a flashcard collection and studying it with FSRS or one of two SM-2 modes. It also includes notes, Anki import/export, Japanese learning tools, AI-assisted card creation, Syntezb practice and the optional Arcadb game area.

Your collection is saved in your browser. No Fiszkb account is required. Optional synchronization uses your own Cloudflare R2 bucket. The core app also works as a single downloaded `index.html`, including its styles, fonts, math renderer and built-in game graphics.

New installations start in **English**, with the **OLED** theme and **FSRS** scheduling. A saved language or appearance choice takes precedence. Polish is available from the language button in Settings.

> **License:** Fiszkb is open-source software licensed under the **[GNU General Public License v3.0](LICENSE)**. You may use, study, modify, host and redistribute it, including commercially, subject to the GPL's conditions. See [License and contributions](#license-and-contributions).

## Contents

- [Getting started](#getting-started)
- [Cards and collection management](#cards-and-collection-management)
- [Studying and scheduling](#studying-and-scheduling)
- [Syntezb](#syntezb)
- [Notes, statistics and appearance](#notes-statistics-and-appearance)
- [Japanese learning tools](#japanese-learning-tools)
- [AI generation and translation](#ai-generation-and-translation)
- [Import, export and backups](#import-export-and-backups)
- [Cloud synchronization](#cloud-synchronization)
- [Arcadb and Lochb](#arcadb-and-lochb)
- [Keyboard controls](#keyboard-controls)
- [Offline use and data storage](#offline-use-and-data-storage)
- [Source, build and verification](#source-build-and-verification)
- [License and contributions](#license-and-contributions)

## Getting started

1. Open **[fiszkb.pages.dev](https://fiszkb.pages.dev)**.
2. Open **Add**, choose a new or existing deck, and paste cards in the format below. You can also import a collection.
3. Open a deck or folder to study. Reveal the answer, then rate your recall.
4. Adjust appearance, scheduling, audio and your daily goal in **Settings**. Individual decks have additional overrides.
5. Download a full backup for a separate copy of your data. Set up R2 if you want to synchronize devices.

On a supported browser, install the hosted app using the browser's install command or **Add to Home Screen**. PWA installation requires HTTPS or localhost; it is separate from opening a downloaded HTML file.

### Using only `index.html`

Download and open the file in a modern browser. Creating and editing cards, studying, saving and reopening, notes, Syntezb, math rendering and built-in game graphics do not require sibling assets.

The HTML contains the application, **not your personal collection**. Cards and media remain in that browser's storage. Move them using a backup or R2. Features needing external services are listed [below](#offline-use-and-data-storage).

## Cards and collection management

### Create and edit

The Add view accepts multiple question/answer pairs:

```text
[Q] What is a mitochondrion? [/Q] [A] An organelle involved in cellular energy production. [/A]
[Q] What is the derivative of $x^2$? [/Q] [A] $2x$. [/A]
```

The markers delimit the sides; content can span multiple lines. The form can insert card/image markers, clear a draft, save to a deck or download the entered set.

| Content | How it works |
| --- | --- |
| Text and formatting | Supported formatting is rendered; imported HTML is processed rather than executed as an arbitrary page. |
| Images | Attach files, paste images into the editor or use supported URLs. Either side can contain an image, with a larger preview. |
| Audio | Attach or reference audio on either side; play manually or enable automatic playback. |
| Math | Inline `$...$` and display `$$...$$` use the embedded KaTeX renderer. |
| Cloze deletions | Anki-style `{{c1::hidden text}}` is supported. Different numbers create separate cards; reusing a number groups deletions. The editor can turn a selection into a cloze. |
| Imported Anki content | Supported templates, reverse cards, clozes, Image Occlusion, images and audio have import handling. See [Import and export](#import-export-and-backups). |

Edit cards from the collection or during study. The management view has search and bounded pages, avoiding a DOM element for every card in a large collection.

### Organization

- Create, rename and pin decks, folders and notes.
- Move decks between folders or study a folder's decks together.
- Select multiple items for available bulk operations such as moving, exporting, pinning and deleting.
- Archive decks/folders to hide them from the active collection, then restore them.
- Move deleted items to Trash, restore them or permanently delete them. Archive and Trash serve different purposes.
- Export individual decks, folders, notes or selected groups.
- Merge two decks and choose which one remains. Exact card signatures identify duplicates; practice history is merged and the more advanced scheduling record is retained where applicable. This is not AI-based semantic deduplication.

### Search

Search covers **cards, decks, folders and notes**. Filters include collection scope, active/archived visibility, pinned items, learning status, difficulty, card type and media. Sorting depends on the category: review date, interval, lapses, repetitions, title, note length and other relevant fields.

Quoted phrases, exclusions and operators are supported:

```text
deck:"Japanese basics" is:due
folder:"Exam revision" is:cloze
q:mitochondria -is:image
is:math
```

Operators: `deck:`, `folder:`, `q:`, `a:` and `is:`. Supported `is:` values include `new`, `learn`, `due`, `young`, `mature`, `mastered`, `hard`, `easy`, `lapsed`, `leech`, `basic`, `cloze`, `io`, `image`, `audio`, `media`, `nomedia`, `math`, `kanji`, `pinned` and `archived`. These are Fiszkb's classifications; “mastered” does not prove permanent recall.

## Studying and scheduling

### Normal study

Reveal the answer, then choose **Again**, **Hard**, **Good** or **Easy**. Easy is optional and can be enabled in Settings. Normal grades update the schedule; buttons show their proposed intervals.

Reverse the initial side, shuffle or use insertion order, with per-deck overrides. Undo restores the previous card and its scheduling state, rather than just navigating backward.

### Three schedulers

| Mode in Settings | Interval calculation | Same-session returns |
| --- | --- | --- |
| **FSRS** | Built-in stability/difficulty model with fixed weights and a desired retention target of 90% by default. | All grades can return after their deadline. |
| **SM-2** | Fiszkb's SM-2-based interval/ease rules. | All grades can return after their deadline. |
| **SM-2 Fiszkb** | The same interval formula as SM-2. | Again returns in the current session. Hard/Good/Easy require both an elapsed deadline and entry into a later session. |

The SM-2 modes differ in **return behavior**, not their formula. With default interval settings, a new card graded Hard gets 5 minutes, Good gets 10 minutes and Easy gets 1 day. Again gets 1 minute. Subsequent intervals depend on grade, previous interval and ease. These are Fiszkb's rules, not every scheduling rule used by Anki.

FSRS stores stability, difficulty, last review time and lapses. Positive ratings use whole-day intervals, subject to deck settings. It uses bundled weights; it does **not** train a personal parameter optimizer. Desired retention is a model input, not a guaranteed recall percentage.

Changing schedulers preserves progress. FSRS derives an initial estimate from interval/ease data when a card lacks native FSRS state.

### Exactly when cards return

- A timer never replaces the card you are currently answering.
- At the next card boundary, elapsed in-session returns take priority over the ordinary backlog. Multiple eligible returns are ordered by deadline.
- In every scheduler, **Again** becomes eligible after approximately one minute and returns after you finish the current card.
- If no other ready cards remain, Again can return **before** its minute has elapsed. It keeps returning until positively graded.
- Hard/Good/Easy never receive that early-return exception.
- An empty session can wake at the next eligible deadline. SM-2 Fiszkb still defers positive grades until a later session.
- Returning from a background tab rechecks deadlines. Closing the app does not reset saved review dates.

### Deck settings and tools

A deck can override daily new/review limits, FSRS retention (70–99%), interval multiplier, maximum interval, starting side, order and automatic audio.

Settings affect subsequent grades. **Recalculate review dates** separately updates existing FSRS deadlines. Other tools reset difficult cards using a stored FSRS lapse threshold, reset today's deck counters or restore default deck settings. Progress resets and a full application reset are separate actions.

### Free practice and scratchpad

Free practice works outside the scheduled queue and does **not** update SRS schedules or earn Iskierkb.

The scratchpad is a study drawing surface with undo/clear controls and normal, enlarged or disabled modes. It is separate from Notes.

## Syntezb

Enable **Experimental features** in Settings to reveal Syntezb. It creates short adaptive sessions from your existing cards and does not need an AI key.

Choose all active decks, a deck or a folder. The scope picker offers search, deck/folder filters and recent study scopes near the top. Sessions can resume, results can be undone, and practice history is saved separately from normal scheduling.

When R2 autosync is enabled, leaving Syntezb checkpoints the local results and schedules synchronization after that save succeeds. Offline changes remain pending until a connection returns.

The local analyzer uses text, similarity, ambiguity checks, scheduling information and previous practice/confusions to select suitable tasks:

| Exercise | What you do |
| --- | --- |
| Choose an answer | Select the source answer matching a question. |
| Choose a question | Match an answer to its question when reverse matching is suitable. |
| Match | Match questions and answers from the selected material. |
| Fill in | Complete a supported blank using supplied choices. |
| Does it match? | Decide whether a displayed question/answer pair belongs together. |
| Recall | Reveal the original answer and assess whether you remembered it. |

The UI selects forms adaptively; it does not expose every internal type as a separate selectable mode. Unsuitable or ambiguous material falls back to simpler recall. Specialized cards can retain their original presentation.

**Syntezb is local practice, not generative AI.** It uses source card material, sends no collection to an AI provider and does not change SRS dates. It is not a factual checker: incorrect source material remains incorrect.

Worker analysis uses acknowledged batches and streamed results. The main-thread fallback yields between batches, and selectors/results are bounded. Automated coverage includes 40,000 synthetic cards; that is a test case, not a universal memory or performance guarantee.

## Notes, statistics and appearance

### Notes

The optional Notes tab supports titles, pinning, search and JSON import/export. Formatting includes bold, italic, underline, strikethrough, highlighting, lists, checkboxes, separators and undo/redo. Notes save locally and participate in R2 sync.

### Statistics

Statistics cover daily study time, goals, streaks, history, collection/deck counts and memory stages. FSRS analysis also presents model-derived forgetting/recall information and a 14-day review-load forecast.

The timer counts time in the study view, stops while hidden and rejects large suspended-timer gaps. The daily goal defaults to 15 minutes. A streak reflects days meeting the relevant time goal, not app launches. Memory-health and forecast displays are estimates from the schedule.

### Appearance

OLED is the initial theme. OLED and Hacker are dark-only; other palettes offer light/dark variants. A custom accent can generate a palette.

Settings include visual effects, Legacy appearance, a compact top bar, simplified interface, study counts, Easy, audio and scratchpad controls. Holding a title reveals long names. Optional visual Easter eggs include animated cats and do not change card schedules.

English/Polish switches the **interface**, not your card content. Translating a deck is a separate explicit action.

## Japanese learning tools

**Kana/Kanji stroke order:** show on the front, back, both or neither side. Basic kana data is bundled. Other supported characters are fetched from KanjiVG when needed and cached; a first lookup can require internet.

**Text to speech:** choose sides, automatic reading, a Japanese voice and speaking rate. A non-Japanese side can optionally be read in English or Polish. Browser/system voices determine availability, pronunciation and offline behavior. Recorded card audio is a separate source.

**Pitch accent:** choose a side and download the Kanjium database once, or import its text file. The separate local accent cache is excluded from normal backups and R2. TTS/pitch settings are device-specific and need configuring on another device.

## AI generation and translation

Optional AI features use **Google's Gemini API with your own key**. Flashcards, scheduling, notes and Syntezb work without it. The AI-feature toggle is separate from the Experimental features toggle that exposes Syntezb.

### Generate cards

1. Configure an API key and model; the app can request the available model list.
2. Add files and/or pasted text, a deck name and optional instructions.
3. Choose a batch size: 10, 15, 20, 30, 40 or 60 cards.
4. Review the generated batch, edit cards and select what to save.
5. Continue, skip/regenerate a batch, change instructions or finish. Accepted cards go into a deck in the **AI Flashcards** folder.

The workspace supports saving/resuming local work, streamed output, retries and some model fallback. Available models and quotas depend on Google; not every account/file will generate successfully.

Up to **15 files** can be added at once. Processing routes differ:

| Input | What reaches the model |
| --- | --- |
| PDF, supported images and audio | File content, inline for smaller material or through the provider's upload route where needed. |
| DOCX, PPTX, XLSX, ODT/ODP/ODS, EPUB, RTF | Text extracted in the browser; embedded pictures and original layout are not preserved by this route. |
| TXT, Markdown, CSV/TSV, JSON, XML, YAML, HTML and supported subtitle/text formats | Decoded or extracted text. |
| Pasted material | The supplied text. |

Old binary DOC/PPT/XLS files need conversion to a supported modern format or PDF. The app limits combined extracted/pasted text to 2,500,000 characters; provider limits also apply.

You can instead copy the supplied card-generation prompt into an external AI tool, then paste its `[Q]`/`[A]` output into Add.

### Translate a deck

Translate targets the **current interface language**, English or Polish. All card text in that deck is sent to the configured AI in batches. The prompt asks it to preserve studied vocabulary while translating explanations, and validation checks protected technical/media markers and card identities.

Preview before applying. Cancelling leaves the original unchanged; applying is refused if the source text changed during the operation. Scheduling and media are retained.

An applied translation keeps an undo snapshot for **48 hours**. Restoration also depends on the deck still matching the tracked translated content. Active backups expire, but retained historical R2 revisions may contain older copies; see [sync retention](docs/SYNC.md).

Review AI output for mistakes before studying it. Material goes directly to Google. The API key remains on your device and is excluded from the collection's R2 save.

## Import, export and backups

| Transfer | Behavior |
| --- | --- |
| Fiszkb full backup, `.json` | Restores saved app state and included media after confirmation, replacing the current collection. |
| Deck/folder/selection exports | Import into the collection with duplicate-resolution controls. |
| Note exports | Import single/grouped notes with duplicate handling. |
| Anki `.apkg` / `.colpkg` | Read supported package databases/media, then select decks and options. |
| Anki text `.txt` / `.tsv` | Use the supported text-export import flow. |
| Anki export `.apkg` | Choose decks/folders; optionally include SRS progress, folder-style names and images/audio. |
| Arcadb save `.json` | Transfer game-area state through its separate controls. |

### Anki compatibility

Import offers supported template reconstruction or explicit field mapping with a preview. Options include preserving scheduling progress, importing study-time history, preserving subdecks/folders and putting field labels on the back.

Basic/reverse cards, separate cloze cards, supported Image Occlusion representations, formatting and referenced media have import handling. Custom Anki JavaScript, templates and add-ons do not all have Fiszkb equivalents.

Scheduling transfer covers intervals, review dates, repetitions and ease fields. It is **not** AnkiWeb sync or lossless interchange of Anki's complete FSRS configuration/review engine. Use a Fiszkb backup for complete native state.

### `.json` backups with media

Without stored media, a backup is ordinary JSON. With media, it can use Fiszkb's own container: a JSON header followed by binary media records, still named `.json`. Reimport through Fiszkb; generic JSON parsers need not accept the whole file.

Media is assembled in bounded internal chunks to reduce peak memory use. This is not an 85 MB cap on the whole collection. Browser storage, file handling and memory still set practical limits.

Full backups do not copy every device cache or credential. R2/API keys, local voice settings and the pitch database use separate storage. Keep downloaded backups outside the browser to protect against clearing site data.

## Cloud synchronization

Sync connects Fiszkb copies to **your own private R2 bucket**. There is no central Fiszkb account or AnkiWeb connection.

### Setup

1. Create/choose a Cloudflare R2 bucket and bucket-scoped credentials with the required object read/write and listing permissions.
2. Allow the app's origin in CORS. For the hosted app it is `https://fiszkb.pages.dev`.
3. In the cloud dialog, enter **Account ID**, **Bucket name**, **Access Key ID** and **Secret Access Key** on each device.
4. Save/test the configuration, then **Synchronize**. Automatic sync is optional.

CORS example for the official hosted app:

```json
[
  {
    "AllowedOrigins": ["https://fiszkb.pages.dev"],
    "AllowedMethods": ["GET", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

Exposing ETag response headers is optional: the compatible read path obtains object versions from S3 listing responses. HEAD is not required. A private/local copy has another origin and may need another CORS entry. Never commit credentials or share a filled-in configuration screenshot.

### Shared and local data

| Shared through R2 | Kept on the device |
| --- | --- |
| Decks/cards, referenced stored media, complete native scheduling | R2/AI credentials |
| Folders, notes, archive/trash, deck configuration | Voice selection and TTS/pitch preferences |
| Study statistics, shared app preferences, recent study scopes | Pitch-accent database and derived caches |
| Syntezb practice/confusion history and saved settings | Uploaded custom HTML games and their individual saves |
| Accepted AI-generated cards, as ordinary deck content | Unaccepted batches and source files in the local AI generation workspace |
| Iskierkb wallet and built-in Lochb state | Current ordinary SRS session queue |

Automatic sync is scheduled around changes and lifecycle events, with deferrals during study/import and relevant dialogs. Exiting ordinary study, Syntezb or Arcadb waits for the local checkpoint before scheduling sync. It reacts to reconnection and pending edits on focus. Upload-on-page-leave is best-effort; closing the browser does not guarantee transfer completion.

**Synchronize** checks the shared revision before selecting upload/download. If both copies changed since their last shared state, it preserves the conflict for an explicit choice instead of choosing by device clock. **Force upload/download** are deliberate replacement actions: review the displayed save information first.

Changed decks upload as immutable revisions before a conditional manifest commit. Downloads are staged and checked; failed transfers or changed local snapshots are not marked synchronized. These safeguards do not make sync an independent backup service.

Objects are **not end-to-end encrypted by Fiszkb**. Old revisions are retained; automatic historical garbage collection is not implemented. Use current versions on all devices. Format 3 needs writers from 1.10.8 onward, with compatible R2 reads fixed in 1.10.10+. Independent translation-cleanup workers need the matching helper.

See [docs/SYNC.md](docs/SYNC.md) for commit rules, conflicts, compatibility and translation-history retention.

## Arcadb and Lochb

Arcadb is optional and initially hidden. **Tap/click the Fiszkb logo seven times within three seconds**, or type **`arcadb`** outside an editable field, to toggle access.

### Iskierkb

Normal scheduled card ratings earn game currency:

| Grade | Iskierkb |
| --- | ---: |
| Again | 0 |
| Hard | 1 |
| Good | 2 |
| Easy | 3 |

A positive rating less than **2.3 seconds** after the previous positive rating earns nothing. Every positive click advances the clock, including blocked rewards; Again, Undo and session changes do not reset it. Fast grades still update SRS. Free practice earns nothing, and Undo reverses its corresponding award.

This is a client-side game economy, not server-verified anti-cheat or a monetary balance. There is no Iskierkb payment/purchase system.

### Lochb

Explore generated floors, defeat each guardian and descend. The action-driven torch consumes Iskierkb as fuel; moving, fighting and other actions cost light.

Features include:

- manual/automatic play, floor repetition, minimap, floor themes and omens;
- telegraphed enemy attacks, parries, clickable weak spots, critical hits, bleeding and potions;
- levels, equipment upgrades, a companion, loot, three equipped artifacts, rarities and smelting;
- resource production, mines, crafting, merchants, events and blood-boon progression;
- bestiary entries revealed by defeating creatures;
- distinct death/retreat reset rules, explained by in-game help;
- touch controls, keyboard input, sound settings, fullscreen and save/reset controls.

| Class | Ultimate | Effect |
| --- | --- | --- |
| Knight | Oath Verdict | Armor-piercing strike with counterattack protection. |
| Monk | Five Strikes of Dawn | Guaranteed strikes and health restoration. |
| Brute | Colossus Fury | Armor-ignoring strike and a stun. |

Ultimate charge comes from successful hits, parries, weak spots and kills, **not elapsed time**. It persists between fights; class changes, death and retreat reset it. Activate the screen button or **U** at full charge during combat. Potions briefly add a subtle effect to the portrait.

### Imported games

Import compatible HTML games or use the downloadable bridge/specification to adapt a game. Custom games run in sandboxed iframes and use the Arcadb bridge for saves/spending. The supplied bridge also supports standalone mode.

Import trusted games: sandboxing limits integration with the parent app, but does not guarantee arbitrary HTML has no network behavior or unsafe content. Custom game files/saves stay local and are excluded from R2. Their copyrights/licenses remain separate from Fiszkb's.

## Keyboard controls

The **?** dialog contains the full context-specific shortcut list.

| Context | Keys |
| --- | --- |
| Navigation | `/` search, `T` cycle collection tabs, `?` help, `Esc` close/leave |
| Study | `Space` reveal/flip, `↑` return to question |
| Ratings | `1` / `←` Again, `2` / `↓` Hard, `3` / `→` Good, `4` Easy when enabled |
| Study tools | `Z` / `Backspace` Undo, `E` edit, `R` audio/TTS, `B` scratchpad |
| Forms | `Ctrl+Enter` save card or entered set |
| Cloze editing | `Ctrl+Shift+C` new number; `Ctrl+Alt+Shift+C` reuse number |
| Notes | Formatting shortcuts, `Ctrl+Z`, `Ctrl+Y` / `Ctrl+Shift+Z` |
| Lochb | `W/S` forward/back, `A/D` turn, `Q/E` sidestep, `Space` action, `2` parry/second choice, `3` potion, `U` ultimate |

Shortcuts depend on the active view and are suppressed or handled differently in text fields/modals. They are not all global commands.

## Offline use and data storage

| Feature | Connection requirement |
| --- | --- |
| Core cards, SRS, notes, Syntezb, fonts, math, built-in game graphics | Bundled in the HTML; no separate asset download. |
| Installed PWA shell | Initial successful visit/install and a supported secure origin. |
| R2 sync | Network access to the configured bucket. |
| Gemini generation/translation | Network, your key and available model/quota; selected material goes to Google. |
| Some Anki/Office/ZIP import/export routes | Optional libraries load from external CDNs; an initial online fetch may be necessary. |
| Uncached KanjiVG characters / pitch database | Initial download, then cached reuse. |
| Speech synthesis | Depends on the browser/system voice; some voices need internet. |
| Remote card images/audio | Their host must be available unless the media was imported/stored locally. |

Collections/media use IndexedDB; small preferences use localStorage. The installed shell uses a service-worker cache. Data belongs to a browser profile and origin: another browser, private session, domain or copied HTML path may have separate storage.

Saves are coalesced and failures trigger recovery messages, but browser storage can still be denied, filled or removed. A browser save is not a separate backup. If saving fails, export before closing or clearing data.

Updates refresh the cached app shell without requiring a collection reset. Check the version in Settings after deployment; allow the service worker to update and reload again if an old shell remains visible.

## Source, build and verification

### Repository layout

| Location | Purpose |
| --- | --- |
| `index.html`, `sw.js` | Generated runtime, checked in for direct static serving |
| `src/index.template.html` | Structure and explicit build includes |
| `src/js/`, `src/css/` | Maintained logic/styles |
| `src/assets/` | Embedded fonts and lossless sprite data |
| `src/vendor/` | Math renderer, licenses and provenance |
| `tools/` | Build, checks and packaging |
| `tests/` | Unit, browser, storage, cloud, graphics and SRS regressions |
| `docs/` | Architecture, sync and verification details |
| `LICENSE` | Terms for Fiszkb's own code |
| `THIRD-PARTY-NOTICES.txt` | Separate third-party notices |

Source parts are concatenated in classic-script order. They are build inputs, not individual runtime downloads. CSS is compiled, fonts and lossless graphics are embedded, and math code activates when needed.

### Build and check

Use **Node.js 20+** and **Python 3.9+**. Verification uses Node 24 and Python 3.12.

```text
npm ci
npm run build
npm run check
npm run format:check
```

Edit `src/`, then rebuild. Python's standard library builds without network access or a bundler. The root application license is embedded in the HTML alongside the separate third-party notices.

For private local development:

```text
python -m http.server 8000 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8000`. Self-hosting and public deployments are permitted under [GPL v3.0](LICENSE).

### Tests

Install Playwright WebKit where the suite expects it. PowerShell:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) 'tests/.browsers'
npx playwright install webkit
npm test
```

Coverage includes recovery/persistence, single-file operation, graphics, games, 40,000-card analysis and synchronization. SRS tests include **384 scheduler/history/scope/grade combinations** and **360 mixed-answer steps** checked against an independent model.

The full release suite passed **114/114 tests on 1.10.13**, including seven Syntezb exit-sync scenarios. Fresh-install language and saved preferences are also covered. [Verification](docs/VERIFICATION.md) records the scope; [tests/README.md](tests/README.md) explains reproduction.

Cloud automation uses synthetic data and simulated S3/R2 with disposable browser storage. Windows WebKit is not a physical-iPad benchmark. Real-device confirmation has also been reported for R2/Syntezb with a large collection. A recent full Anki-collection import was not manually rechecked during this release work.

### Packaging and deployment

```text
npm run build
npm run package
```

- **`fiszkb-1.10.13-deployment.zip`** contains eight runtime files: HTML, service worker, two manifests, icon, screenshot, third-party notices and `.well-known/assetlinks.json`.
- **`fiszkb-1.10.13-github.zip`** contains maintained source, generated runtime, this README, license, tools, tests and documentation.

The deployment contains no personal collection/credentials. The GitHub archive excludes dependency/browser downloads, local backups, previous releases and test results. Every archived file is read back and compared with source bytes. Hashes are recorded in `tests/results/release-1.10.13.json`.

You can publish the runtime to static HTTPS hosting under the GPL's terms. The official public installation is **[fiszkb.pages.dev](https://fiszkb.pages.dev)**. For your own deployment, review `.well-known/assetlinks.json`: its existing Android association belongs to the original Android app and should not be reused for an unrelated app.

## License and contributions

Fiszkb is licensed under the **[GNU General Public License, version 3](LICENSE)**.

- You may use, inspect, modify and redistribute the software.
- Self-hosting, public hosting and commercial use are allowed; no separate permission is required for those uses under this license.
- When distributing covered software, preserve the required license/copyright notices, identify modifications and provide the Corresponding Source as required by the GPL.
- Modified covered versions must remain under the GPL's terms when distributed. The license does not let you remove recipients' GPL rights or turn covered derivatives into proprietary software.
- Your cards, notes and imported games are not automatically relicensed merely because you use them in Fiszkb. Third-party components retain their own licenses and notices.

The complete [LICENSE](LICENSE) governs; this is a summary. The official license text is also available from the [Free Software Foundation](https://www.gnu.org/licenses/gpl-3.0.html).

For bug reports, include version, browser/device, reproduction steps and expected behavior. Use synthetic/redacted material. Do not attach API keys, R2 credentials or a private collection by default.

Keep contributions focused, edit maintained sources, rebuild outputs, run relevant checks and describe testing. Submit your own work or material compatible with the project's GPL terms. Contributions are accepted under the project's license. Read [architecture notes](docs/ARCHITECTURE.md) before changing storage, scheduler queues or execution order.
