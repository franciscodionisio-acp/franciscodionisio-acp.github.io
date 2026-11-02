# Francisco Dionísio — Academic Website

A responsive, accessible, static personal academic website in English. **No plugin or server required** to open it; double-click `index.html` in the extracted folder.

## Files

- `index.html`: semantic page content, biography, academic information and research topics.
- `assets/styles.css`: visual design, colours and responsive styles.
- `assets/app.js`: publication search, filters, mobile navigation and CSV export.
- `assets/publications.js`: publication dataset loaded locally by the website.
- `data/publications.json`: the same data in a convenient editing format.
- `assets/bacterial-cell-hero.webp`: chosen Option C — stylised bacterial cell with DNA/plasmid annotations, not experimental data.
- `assets/favicon.svg`: simple FD icon.

## Publishing

### Netlify Drop — simplest
1. Visit https://app.netlify.com/drop
2. Drag the **extracted website folder** (containing `index.html`) into the deployment area.
3. Use the provided `netlify.app` address; optionally configure a custom domain.

### GitHub Pages — durable option
1. Create a public GitHub repository named `YOUR-USERNAME.github.io`.
2. Upload the **contents** of this folder to the repository root.
3. In Settings → Pages, choose Deploy from a branch and the root folder of the default branch.
4. The site will become available at `https://YOUR-USERNAME.github.io/` after deployment.

## Updating publications

Edit `data/publications.json`, then regenerate `assets/publications.js` from it. Example in Python:

```python
import json
from pathlib import Path
root = Path('.')
publications = json.loads((root / 'data/publications.json').read_text(encoding='utf-8'))
(root / 'assets/publications.js').write_text('window.ACADEMIC_PUBLICATIONS = ' + json.dumps(publications, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
```

You can also ask ChatGPT to update the files whenever a new paper is published.

## Source & editorial notes

All biographical information and publication metadata used to draft this first version comes from the **two PDFs supplied by the website owner** (ORCID print view and Scopus author profile). The Scopus PDF shows 52 documents, 1,888 citations, and an h-index of 21; these are *snapshot values*, not a live feed. It lists the paper “From nature or from a laboratory? ...” twice (2025 and 2026), with the same DOI; the website shows it once using the 2026 Scopus year. A 2021 Scopus journal article on COVID-19 and resistance-gene diversity is **not** assigned the DOI of its ORCID-listed preprint. The selected 2025 rare plasmid biosphere item is clearly tagged **preprint**. The records displayed here comprise 51 distinct Scopus listings plus 3 additional ORCID works (1 preprint, 1 book and 1 book chapter), for **54 total** entries. Some author names in the source PDF were abbreviated, so the dataset reproduces the exported abbreviated strings rather than inventing missing names. Selected DOI metadata was matched against the ORCID PDF, not queried live.

**Please review before publishing:** current positions, research descriptions, completeness of bibliography, citation dates and public contact details. A real portrait, lab logo, or professional CV PDF were not attached and are not included. The decorative molecular graphic is not an empirical figure.

## License

The original website code/layout and the selected AI-generated illustration are supplied for the website owner's use. Bibliographic data and titles are attributed to their respective sources, publishers and authors. External profile and DOI destinations may change.

## V2 visual update

The original circular plasmid illustration in the homepage hero was replaced by the selected third option (Option C), a stylised bacterial cell. The image is locally included as a compressed WebP file. The rest of the page content and publication functionality is unchanged.
