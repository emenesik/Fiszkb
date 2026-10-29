# Changelog

## 1.10.14

- Localize generated audio buttons and Kana/Kanji replay captions inside flashcards, whose source content remains excluded from interface translation.
- Update these controls when the interface language changes and when stroke diagrams finish rendering. Preserve the card's original text.

## 1.10.13

- Automatically synchronize after leaving Syntezb when R2 autosync is enabled. Preserve the outgoing view until navigation recognizes the transition.
- Wait for successful local checkpoints before scheduling study-view exit sync. Respect offline mode, disabled autosync and reopening a study view during a save.
- Add seven browser regression scenarios for Syntezb exits and make Polish-label test fixtures select Polish explicitly. Verify that fresh installs still default to English and preserve a later Polish choice.
- Replace the README with a complete guide to implemented features, data boundaries, offline behavior and development.
- Use GNU GPL v3.0, matching the license selected in the public repository. Embed its text in the portable HTML and include LICENSE in the source archive. GPL permits public hosting and commercial use under its terms.

## 1.10.12

- Default new installations to English regardless of browser language. Preserve an existing Polish or English preference.
- Use the same default for startup labels, recovery messages, the initial PWA manifest and the offline fallback page.

## 1.10.11

- Remove placeholders from all four R2 configuration inputs and remove their obsolete translation entries.
- Advance the service-worker cache version so installed copies refresh the form.

## 1.10.10

- Remove the mandatory exposed ETag and HEAD requirements introduced in 1.10.8/1.10.9. Existing bucket configurations can use the S3 listing response body to obtain the object version.
- Bind a fresh GET to the listed version with If-Match. Restart a changed read with a bounded retry count, including updates that are later reverted. Keep conditional writes and genuine conflict protection.
- Apply the compatible read path to manifests, media indexes and translation cleanup without changing the cloud format.
- Add tests for manual and automatic sync with every ETag response header hidden and HEAD forbidden, malformed listing XML, similarly named objects, reverted updates and repeated version changes.

## 1.10.9

- Fix conditional writes when a GET response exposes a weak ETag. Read the strong object validator with HEAD and bind a fresh GET to that version before writing.
- Apply the verified read path to manifests, media indexes and translation-backup cleanup.
- After HTTP 412, retry a manifest only when its complete content is unchanged; acknowledge an identical snapshot that was already committed after a lost response. Preserve genuinely conflicting data.
- Replace the raw precondition error with an actionable message in Polish and English.
- Add transport-level regression tests that exercise request signing, headers and conditional responses rather than replacing the high-level R2 functions.

This release still required an exposed strong ETag through HEAD. It did not cover buckets hiding that response header; 1.10.10 fixes that regression.

## 1.10.8

- Keep the full flashcard experience in a standalone HTML document, including fonts and offline math rendering.
- Replace the large embedded sprite run stream with a lossless WebP atlas. Pixel comparisons cover all 52 sprites. Native image decoding runs during startup; the original lightweight renderer remains available if decoding fails.
- Remove the unused procedural SDF renderer and stop shipping duplicate font, math and game assets in the deployment archive.
- Group editable JavaScript and CSS into source files with a deterministic, offline build. Preserve classic-script scope and execution order.
- Standardize source formatting and retain concise English comments explaining important constraints. Preserve third-party notices.
- Hash complete deck content for cloud deltas, including media references, exact FSRS state, configuration and statistics.
- Upload immutable deck revisions before conditionally committing the manifest. Reject stale concurrent writers and keep uncommitted local changes pending.
- Retry conditional media-index conflicts without losing another device's entries. A failed index upload remains pending; missing media prevents a false successful commit.
- Stage and verify downloads before replacing local data. Preserve local edits made during a transfer and restore the old library when local persistence fails.
- Preserve the documented local-only boundary for uploaded games, credentials and device-specific settings. Synchronize the built-in wallet and Lochb state.
- Preserve recent study scopes through settings validation and reloads. Mark Arcade-only changes for synchronization without serializing the whole library on every game action.
- Add regression coverage for portable-file operation, corrupted transfers, conflicting writers, media failures, persistence failures and cloud migration.

The SRS return behavior fixed in 1.10.7 remains unchanged: elapsed returns take priority at the next card boundary, with the separate SM-2 Fiszkb rule for positive grades.
