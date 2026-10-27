# Weekly activities

The site loads `weekend.json` using a relative URL, so it works under the GitHub Pages `/xibei/` path. No build step or package installation is needed.

## Update content without changing the page

1. Follow the checks and claim process in `AGENTS.md`.
2. Update the date range, title, intro, and `updatedAt` using Sydney dates (`YYYY-MM-DD`). Do not change the schema version without coordinating a renderer change.
3. Edit `activities` and pick exactly two distinct IDs in `recommendedIds`. Keep IDs stable for the same activity. The remaining activities appear under “更多选择”.
4. Update `alternatives`, `reminder`, `weatherUrl`, and `sources`. Alternative event times must state the full date/year, or the full period for ongoing events.
5. Run `node scripts/check.mjs`, preview the page, and submit a content-only PR.

## Activity fields

| Field | Meaning |
| --- | --- |
| `id` | Unique stable identifier used by the recommendations. |
| `title`, `time` | Event name and full event date/time or explicit need to check sessions. |
| `drive` | Approximate travel time from Castle Hill; distinguish travel from activity duration. |
| `price` | Ticket prices, age thresholds, and additional costs. |
| `booking` | Reservation requirement; say when availability has not been checked. |
| `description` | Longer itinerary text, shown only when expanded. Plain text, no HTML. |
| `officialUrl`, `mapUrl` | Absolute HTTP(S) links, or null when unavailable. |
| `reviewUrl`, `rating` | Optional venue-review link and rating; do not substitute a venue rating for an event rating. |
| `verifiedAt` | Date the official event information was actually checked, or null. Updating the file does not verify every event. |
| `budget` | Optional `{ "label": "...", "note": "..." }`; specify number and ages of people, inclusions, assumptions, and extra costs. |

Alternatives use `title`, `officialUrl`, `time`, `location`, `price`, `suitable`, `mapUrl`, and `verifiedAt`. Sources use `label` and `url`. All descriptions are text; do not add markup.

The initial migration preserves the existing event list, labels every activity as unverified, and deduplicates the train listing. It does not re-verify event dates, fruit availability, prices, ratings, or admission. Claude's next research pass should check the original claims against official sources before marking entries verified. Date labels copied into this migration are the original page's intended dates, not new evidence.

## Local preview

Run `python3 -m http.server 8765 --bind 127.0.0.1` from this directory, then open the local HTTP address. Stop the server after testing. There are no analytics or server uploads for the food tracker; backups are local JSON downloads.
