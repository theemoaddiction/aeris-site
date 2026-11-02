# The Record Room

Static record archive at `/records/`. The homepage navigation links to it.

## Updating a release

Edit `catalog.js`. Each record contains an `id`, title, artist, year (or `null`), kind, cover filename, summary, track list, listening links, and related release IDs.

- Set `approx: true` for approximate years.
- Place cover assets in `records/assets/`; use `cover: null` when no verified artwork is available.
- Keep `artNote: "New archive artwork"` on the four newly created early sleeves.
- Tracks with an `audio` URL gain playback and a download link automatically. Use browser-ready formats and repository-relative paths from `/records/`.
- External listening and future Ko-fi shop URLs go in `links` as `{ label, url }`. Do not add a purchase button until the actual listing exists.
- `related` holds release IDs and renders the “Follow the thread” section.
- To share one release, use `/records/#release=owns-your-brain` (substitute the ID).

## Initial source notes

Dates and personal descriptions follow Gordon's account in the archive conversation. Analog Recordings is circa 2001; the anthology is provisionally circa 2014. Cameras is undated: the screenshot's filesystem dates are not treated as publication dates.

LICKER's track lists and production credits come from the supplied `JetSetStereo-LickerAnthology.txt`. Best Week Ever and Keen Tongue are represented as early recording collections subsequently included in the anthology, without claiming they were commercially released independently.

Later digital release dates and track lists were checked against Apple Music and Amazon Music. Further from Familiar's sequence remains unverified and is explicitly labeled alphabetical. Mating in Captivity and the earliest records do not yet have complete track lists here.

Owns Your Brain uses the thirteen MP3s already present in the repository, with their existing display titles. Its blue hallway cover is the original supplied by Gordon. The Aeris entry currently uses artwork already present on the main site and labels it accordingly.

## Checks

`node --check records/catalog.js` and `node --check records/room.js`.

Serve the repository as static files to check all asset paths and audio. No build or installation is required. The existing analytics script is reused. No new service, account, checkout, or backend is required.
