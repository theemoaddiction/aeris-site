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

Dates and personal descriptions follow Gordon's account in the archive conversation. Analog Recordings is circa 2001; its supplied filesystem dates are not publication dates. Gordon dated Cameras to 2005, Until We’re Dead to April 2012, and LICKER Anthology to July 2017. Until We’re Dead uses the supplied original cover and four track titles in confirmed order, with title case applied as requested. Analog’s supplied track titles preserve their original spelling. Cameras’ track note records the confirmed song origins and omission of I’ll Not Contain You from this archive edition; the cover remains on Black Rose EP.

LICKER's track lists and production credits come from the supplied `JetSetStereo-LickerAnthology.txt`. Best Week Ever was never officially released and has no separate catalog entry; its three recordings remain on the anthology. Keen Tongue is represented as an early collection subsequently included in the anthology.

Later digital release dates and track lists were checked against Apple Music and Amazon Music. Gordon confirmed the running orders for Mating in Captivity, Vapid, and Further from Familiar, Pt. 1 and supplied their cover files. Vapid’s description is adapted from his original release copy; its archival note retains two lines from that pitch. Silent eMotion, Black Rose EP, and Lovestar(ved) do not yet have complete track lists here.

Owns Your Brain uses the thirteen MP3s already present in the repository, with their existing display titles. Its blue hallway cover is the original supplied by Gordon. The Aeris entry currently uses artwork already present on the main site and labels it accordingly.

## Checks

`node --check records/catalog.js` and `node --check records/room.js`.

Serve the repository as static files to check all asset paths and audio. No build or installation is required. The existing analytics script is reused. No new service, account, checkout, or backend is required.
