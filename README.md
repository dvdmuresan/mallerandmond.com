# MALLER & MOND — portfolio site

A joint portfolio site for MALLER STUDIO and MOND : STUDIO. It's one page, `index.html`,
with Home, Work, each project, About and Contact all handled inside it.

## Folder

```
maller-mond/
├─ index.html            page markup (header, landing, work, about, contact, footer)
├─ css/style.css         all styles
├─ js/projects.js        the project list — edit this to add or change projects
├─ js/app.js             loader, routing, landing strip, work grid, project pages
├─ fonts/                TRJN DaVinci Text (descriptions)
├─ img/logo/             MALLER & MOND logos (stacked + one line)
├─ img/team/             About page portraits
└─ projects/
   ├─ ryu/               RYU Sando Bar — images (.jpg) and videos (.mp4), in page order
   ├─ walk-with-me/      Walk With Me — Rainy Days record
   ├─ bucharest-food-week/  Bucharest Food Week — festival identity
   ├─ brue/              BRUE — specialty coffee identity
   ├─ almost-sweet/      Almost Sweet — cordials & mixers
   ├─ maier-jewelry/     Maier Jewelry — jewellery rebrand
   ├─ dream-ville-software/  Dream Ville Software — tech identity
   └─ macn/              Museum of Art Cluj-Napoca — museum identity
```

## Run it locally

Open a terminal in this folder and run:

```
python3 -m http.server 8000
```

Then open http://localhost:8000. You can also double-click `index.html`, but the
landing page's automatic black/white text only works when it's served like this.

## Add a project

1. Make a folder `projects/<slug>/` and put the images and videos in it, numbered in
   the order they should appear (`01-…`, `02-…`). Keep images around 2000px on the long
   side; videos as H.264 `.mp4` without sound.
2. In `js/projects.js`, copy the RYU entry and change the text fields.
   - `cover` — the image used on the landing strip, the Work grid and the blurred background.
   - `media` — every image/video with its width `w` and height `h` in pixels; add `video:1`
     for videos. Wide pieces (wider than about 5:4) run full width on the project page;
     the rest are split into two columns.
   - `studio` — `"Maller"`, `"Mond"` or `"Maller & Mond"`.
   - `team` — leave as `""` to hide the Team row.
3. The landing page shows the first 10 projects in the list.

Projects without `cover`/`media` still show generated placeholder images.

## Fonts

Suisse BP Int'l is used if it's installed on the viewer's computer, otherwise
Helvetica Neue / Arial. To make it show for everyone, add the licensed web font files
to `fonts/` and point the `@font-face` rules at the top of `css/style.css` to them.
