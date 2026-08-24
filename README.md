# Story Spark Cinema™

Story Spark Cinema is a kid-friendly, browser-based story and movie studio. Children can create a character, choose a world, build a branching story, turn it into an editable movie, play it in the theater, and export it as a 720p WebM video.

## Highlights

- Five age-aware experiences from toddler through teen
- Branching story engine with multiple endings and rewards
- Character creator with optional local photo upload
- Page-by-page PDF and ordered PNG/JPG/WebP story imports, plus text, Markdown, and Story Spark projects
- Timeline editor, narration, music, effects, and movie theater
- Local movie saving, duplication, deletion, and 720p export
- Installable mobile web app for Android and iPhone
- Offline app shell with no required account or API key

## Run locally

Serve the project directory with any static web server. For example:

```powershell
python -m http.server 5500
```

Then open <http://127.0.0.1:5500/>.

Service workers and phone installation require HTTPS when the site is not running on `localhost`.

## Tests

Run every smoke test with PowerShell:

```powershell
Get-ChildItem tests\*-smoke.js | Sort-Object Name | ForEach-Object { node $_.FullName }
```

All stories, uploaded photos, audio, and saved movies remain local to the browser unless the user explicitly exports a file.
