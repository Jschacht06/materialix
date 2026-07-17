# 🧱 Materialix

> A clean, fast material-list tracker for Minecraft builders. Upload a material
> list export, check blocks off as you gather them, and never lose track of a
> shopping run again.

![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)

[![Try it live](https://img.shields.io/badge/%E2%96%B6%C2%A0%C2%A0TRY%20IT%20LIVE-6fbf4f?style=for-the-badge&logoColor=white)](https://jschacht06.github.io/materialix/)

## About

This project is **fully vibecoded with [Claude Fable 5](https://www.anthropic.com/news/claude-fable-5-mythos-5)** —
every line of code, the design, and this README were written by AI under human
direction. It exists purely for ease of use.

## Features

- 📂 **Drag & drop upload** of a material list `.json` export — or paste the
  raw JSON if that's easier
- ✅ **Check off materials** as you collect them, with satisfying progress
  tracking weighted by block count
- 📦 **Stack math built in** — `644 blocks` reads as `10 stacks + 4`, and huge
  quantities show shulker boxes too
- 🖼️ **Real item icons** — in-game-style inventory renders (stairs, chests,
  and beds show as proper 3D renders), with a color-swatch fallback for items
  the icon CDN doesn't know
- 🔍 **Search, sort, and hide-collected** controls for big lists
- 💾 **Progress persists** in your browser — close the tab, come back
  tomorrow, your checkmarks are still there. Re-uploading the same file
  restores its progress, and recent lists reopen from the start screen
- 🔒 **No accounts, no server, no tracking** — everything runs client-side

## Getting a material list

Export a material list from [Litematica](https://litematica.org/) (or any tool
that produces the same JSON shape). Materialix only needs two fields per entry:

```json
{
  "Materials": [
    { "Item": "minecraft:spruce_planks", "Total": 644 },
    { "Item": "minecraft:lantern", "Total": 26 }
  ]
}
```

Extra fields like `Missing`, `Mismatched`, and `Available` are ignored. A full example lives in
[`sample-data/material_list_example.json`](sample-data/material_list_example.json).

## Running locally

Requires [Node.js](https://nodejs.org/) 20+.

```sh
git clone <this repo>
cd materialix
npm install
npm run dev       # dev server at http://localhost:5173
```

Other scripts:

```sh
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
npm run lint      # lint with oxlint
```

## Deploying

`npm run build` produces a fully static site in `dist/` — there is no backend,
so any static host works:

- **GitHub Pages** (how this repo does it): every push to `main` triggers
  [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds
  the site and publishes it automatically.
- **Netlify / Cloudflare Pages / Vercel**: point the build command at
  `npm run build` and the output directory at `dist`.
- **Your own server**: copy `dist/` behind any web server that can serve
  static files.

Since it's static files only, there's nothing server-side to patch, no
database, and no API to abuse.

## Privacy & security

- Uploaded lists are parsed **entirely in your browser** and stored only in
  your browser's localStorage. Nothing is sent to any server.
- The only external requests are for block icons, loaded from
  [mc.nerothe.com](https://mc.nerothe.com/). A `no-referrer` policy is set, so
  those requests don't reveal what page you're on.
- Production builds ship a strict Content-Security-Policy: scripts only from
  the site's own origin, images only from the site and the icon CDN, and no
  other network calls.
- All user-supplied content is rendered through React's standard escaping — no
  `innerHTML`, no `eval`, no dynamic script loading.

## Project structure

```
src/
  App.tsx                    app shell: header, screen switching, progress state
  components/
    UploadScreen.tsx         drag & drop / paste input + recent lists
    TrackerScreen.tsx        the checklist with search, sort, and progress
    ItemIcon.tsx             CDN item icons with graceful fallback
  lib/
    parse.ts                 material list JSON parsing + validation
    format.ts                item name prettifying, stack math, swatch colors
    storage.ts               localStorage persistence (lists + progress)
sample-data/
  material_list_example.json example export for testing
```

## Acknowledgements

- Block icons served by [mc.nerothe.com](https://mc.nerothe.com/)
- Material lists produced by [Litematica](https://litematica.org/)

*Materialix is a fan-made tool. Minecraft is a trademark of Mojang/Microsoft;
this project is not affiliated with or endorsed by them.*
