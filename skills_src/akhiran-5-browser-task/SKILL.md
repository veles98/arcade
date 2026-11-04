---
name: akhiran-5-browser-task
description: Turn a repeated browser chore (open a site, search, click, download a file, take screenshots, copy a table) into a small Playwright script that does it by itself and records a video of the run. Use when the user says "do this in the browser for me", "automate this website task", "every day I open X and click Y", or wants proof video of an automated web task.
---

# Let the AI do the browser task

The user describes the task in a sentence. You write ONE short Python Playwright script that does it, records a video, and prints a log of every step. The user runs one command.

## Step 1: ask once (only what is missing)
1. The site address and the exact steps a person would do (open, search for what, click what).
2. What counts as done: a downloaded file, a screenshot, copied text?
3. Does it need a login? If yes: stop. Tell the user this skill only does public pages without passwords; they sign in themselves.

## Step 2: setup (one time)
```
pip install playwright
python -m playwright install chromium
```
If Google Chrome is already installed you can skip the browser download and launch it with `p.chromium.launch(channel="chrome")`.

## Step 3: write the script (rules)
- Python, sync API, one file `task.py`, under 60 lines.
- `browser.new_context(viewport={"width": 540, "height": 1170}, record_video_dir="video", record_video_size={"width": 540, "height": 1170}, accept_downloads=True)`; the video is saved when the context closes.
- Many sites have the same box twice (a normal one and a hidden "sticky" or mobile one). Always add `.first` to a locator you click or type into, and prefer the placeholder text the user sees: `page.get_by_placeholder("...").first`.
- Find elements by what a person sees: `get_by_placeholder`, `get_by_role("button", name=...)`, `get_by_text`, or a clear CSS id. Never guess long CSS paths.
- Type like a person: `page.keyboard.type(text, delay=120)`, and `page.wait_for_timeout(600)` between steps so the video is easy to follow.
- Downloads: `with page.expect_download() as d: link.click()` then `d.value.save_as("downloads/" + d.value.suggested_filename)`.
- Screenshots: `page.screenshot(path="shots/step1.png")`.
- Print one log line per step with the time, for example `print(f"{time:.1f}s clicked search")`. Wrap the run in try/finally so the browser always closes.
- End with what was produced (file name and size, or screenshot path).

## Step 4: run and check
`python task.py`, then open the newest file in `video/` and check every step happened. If a step failed, change only that step and run again. Ask the user what they see on the page at that moment (the placeholder or button text); that is usually the fix. Two or three rounds is normal for a new site.

## Rules (always)
- Public pages only. No passwords, no payment, no posting or sending messages, no account changes.
- Respect the site: a few page loads, no loops that hammer it, no scraping behind logins, and follow the site's terms.
- Never solve CAPTCHAs or bypass bot checks; if one appears, stop and tell the user.
- Show the user the script before they run it, in one code block.
