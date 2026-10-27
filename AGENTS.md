# Shared maintenance workflow

This is the canonical workflow for Codex, Claude, and other coding assistants.

## Before every coding session

1. Read the latest body and all new comments on the [collaboration board](https://github.com/ycianzhou-711/xibei/issues/1).
2. Check open pull requests and local changes. Fetch the latest `origin/main` and compare it with the starting commit. Base new task branches on the current remote main.
3. If a new request, claim, or code change overlaps the planned work, discuss it on the board before editing the affected files. Do not assume a posted message has been read or agreed to. Wait for clarification on conflicting work; unrelated work may continue.
4. Post a concise claim describing the scope and files. Do not duplicate existing work. If the board or remote cannot be checked, report the limitation before editing shared work.

Repeat the board, open-PR, and remote checks before submitting or updating a PR, and again before a merge. If main changed, integrate it deliberately, resolve conflicts, and repeat relevant validation.

## Responsibilities

- Claude researches and verifies weekly activities, official URLs, ratings, maps, and booking information. Weekly content belongs in `weekend.json`.
- Codex maintains layout, rendering, and browser-local features in `index.html`, `weekend.js`, and `app.js`.
- Ian gathers information and maintains the weekly workflow. His wife contributes and decides page and feature requirements. Ask the user when product decisions are unresolved.
- Work on independent `claude/...` or `codex/...` task branches. Never push directly to main, force-push shared branches, or discard another person's changes.
- Open a PR, include validation and a preview, and post its link on the board. Ian merges one PR at a time after review. A second PR must synchronize after the first is merged.
- Main is the published GitHub Pages site. Do not merge or change hosting without the user's approval.

## Weekly handoff

Claude runs on Thursday mornings in Sydney time and may not read messages until then. This board is asynchronous, not a live conversation or file lock. Read it at the beginning of every run. Avoid overlapping page work on Thursday mornings unless coordinated there.

After this data split is merged, Claude should update its weekly task to edit only `weekend.json` and open a PR. That external task is not changed merely by adding this file. Announce any data format changes on the board before using them.

## Data and validation

- Read `CONTENT.md` before updating weekly data. Keep stable activity IDs and valid recommendation references.
- Keep `updatedAt` separate from per-item `verifiedAt`. Set `verifiedAt` only after checking the official event source for the correct year. Use null for unverified legacy entries. Never imply a live booking or weather check that was not performed.
- Verify fees and event admission independently from public-transport fares. Clearly label family-budget assumptions and additional costs. Venue ratings are not event ratings.
- Keep the existing `xibei-foods` browser storage key and record shape compatible. Never transmit browser-local family records to the repository.
- Run `node scripts/check.mjs` and relevant browser checks before submitting. Serve the repository over HTTP for preview; fetching JSON does not work reliably from a file URL.

These instructions guide participating assistants. They do not enforce branch protection, prevent uncooperative edits, wake Claude, or guarantee zero conflicts.
