# Francisco Dionísio — Sci-Art rotating 3D bacterium

A procedural, genuinely volumetric Three.js / WebGL bacterium on the homepage. The 3D model makes a full turn in approximately 17 seconds and can be rotated with a mouse or touchscreen drag. It is an artistic illustration, **not a scientifically accurate structural model**.

## Quick deploy to GitHub Pages

1. Download and extract the ZIP.
2. Open your GitHub repository: `https://github.com/franciscodionisio-acp/franciscodionisio-acp.github.io`.
3. Upload the updated **`index.html`** into the repository root and the **two new files** `assets/bacterium-sciart-3d.js` and `assets/bacterium-sciart-3d.css` into the `assets` directory. Commit the changes.
4. Refresh `https://franciscodionisio-acp.github.io/` with `Ctrl + F5`.

**If you have edited index.html on GitHub since the version in this ZIP, do not replace your whole index.html without checking what will be overwritten.** Instead, apply the three very small edits below to your current index.html and add the two new files. No changes are required to your existing `assets/styles.css`.

## Manual integration into your most recent index.html (safest)

### 1. In the `<head>`, immediately after your existing stylesheet:

```html
<link rel="stylesheet" href="assets/bacterium-sciart-3d.css">
```

And next to the other scripts in the same `<head>`:

```html
<script type="module" src="assets/bacterium-sciart-3d.js"></script>
```

### 2. In the right-hand homepage visual, find the image:

```html
<img class="hero-cell-image" src="assets/bacterial-cell-hero.webp" ...>
```

Replace only that **single image element** (not the surrounding `hero-art`, `art-inner`, titles, or bottom labels) with:

```html
<div class="bacterium-sciart-stage" data-bacterium-3d role="img"
     aria-label="A three-dimensional artistic bacterium rotating through 360 degrees">
  <img class="bacterium-sciart-fallback"
       src="assets/bacterial-cell-hero.webp" alt="" width="940" height="995">
  <span class="sciart-orbit sciart-orbit-one" aria-hidden="true"></span>
  <span class="sciart-orbit sciart-orbit-two" aria-hidden="true"></span>
  <span class="sciart-hint" aria-hidden="true">DRAG TO EXPLORE <span>↔</span> 3D MODEL</span>
</div>
```

### 3. Upload the two **new** assets

```
assets/bacterium-sciart-3d.css
assets/bacterium-sciart-3d.js
```

Leave your existing `assets/styles.css`, `assets/app.js`, and `assets/publications.js` as they are.

## How to preview locally

When using ES modules, opening `index.html` directly via `file://` can cause browser security restrictions. Preview with a local HTTP server instead. For example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/` in your browser. If Python is not installed, a Visual Studio local web server works as well.

## How it works

- 360° volumetric rotation about a true 3D Y axis (17 s / turn)
- Teal semi-transparent envelope, internal winding DNA-like strands, plasmid rings, ribosomes, pili and flagella
- Pointer dragging to inspect different sides
- GPU/visibility-conscious rendering; limited pixel density and frame rate
- Respects OS reduced-motion preferences (static 3D presentation, drag remains available)
- Graceful fallback to `assets/bacterial-cell-hero.webp` when WebGL or the Three.js CDN is unavailable

**Internet connection is required** for the Three.js library hosted at `https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js`. This is fine for an ordinary public GitHub Pages website, but might be blocked on some networks. The fallback illustration is stored locally in the `assets` directory.

## Scope

Only the homepage bacterial visual changes. The site menus, affiliations, academic text, publications and book section are preserved as they were in the locally available site snapshot. If your live GitHub repository contains newer edits, use the manual integration method above.

## Validation completed

- JavaScript syntax checked with Node.js
- CSS syntax parsed without errors
- Relative file references and relevant section IDs checked
- Runtime WebGL preview could **not** be verified in the sandbox due to local browser navigation restrictions. Test the published site in Chrome or Edge after upload.
