/* Self-contained publication browser; works from a local file and on static hosting. */
(() => {
  'use strict';
  const papers = Array.isArray(window.ACADEMIC_PUBLICATIONS) ? window.ACADEMIC_PUBLICATIONS : [];
  const $ = (id) => document.getElementById(id);
  const search = $('pub-search'), topic = $('pub-topic'), year = $('pub-year');
  const list = $('pub-results'), count = $('pub-count'), total = $('pub-total');
  const more = $('load-more'), empty = $('empty-results');
  const menuButton = $('menu-button'), nav = $('main-nav');
  let visible = 9;

  // Escape strings from bibliographic data before injecting HTML.
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const displayVenue = (paper) => {
    const venue = String(paper.journal || '').replace(/,\s*(?:19|20)\d{2}\b.*$/, '').trim();
    return venue || 'Source record';
  };
  const validLink = (url) => {
    try { const parsed = new URL(url); return ['https:','http:'].includes(parsed.protocol) ? parsed.href : '#'; }
    catch { return '#'; }
  };
  const getMatches = () => {
    const q = (search.value || '').toLowerCase().trim();
    return papers.filter(p => {
      const matchTopic = topic.value === 'all' || p.topic === topic.value;
      const matchYear = year.value === 'all' || String(p.year) === year.value;
      const matchText = !q || [p.title,p.authors,p.journal,p.doi,p.topic].join(' ').toLowerCase().includes(q);
      return matchTopic && matchYear && matchText;
    });
  };
  const card = (p) => {
    const url = esc(validLink(p.href));
    const authorLine = p.authors ? `<p class="pub-authors">${esc(p.authors)}</p>` : '';
    const label = p.doi ? `Read article (DOI)` : esc(p.linkLabel || 'Find publication');
    return `<article class="pub-item"><span class="pub-year">${esc(p.year)}</span><div class="pub-main"><h3 class="pub-title"><a href="${url}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a></h3><p class="pub-venue">${esc(displayVenue(p))}</p>${authorLine}<div class="pub-tags"><span class="pub-tag">${esc(p.topic)}</span><span class="pub-kind">${esc(p.kind)}</span></div></div><a class="pub-doi" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label + ': ' + p.title)}" title="${esc(label)}">↗</a></article>`;
  };
  const render = () => {
    const matches = getMatches();
    const items = matches.slice(0, visible);
    list.innerHTML = items.map(card).join('');
    count.textContent = String(items.length);
    total.textContent = String(papers.length);
    more.hidden = matches.length <= visible;
    empty.hidden = matches.length !== 0;
  };
  [...new Set(papers.map(p => p.year))].sort((a,b) => b-a).forEach(value => {
    const option = document.createElement('option');
    option.value = String(value);option.textContent = String(value);year.appendChild(option);
  });
  [search,topic,year].forEach(el => el.addEventListener(el === search ? 'input' : 'change', () => {visible = 9;render();}));
  more.addEventListener('click',() => {visible += 12;render();});
  $('download-csv').addEventListener('click', () => {
    const columns = ['year','title','authors','journal','type','topic','doi','href'];
    const rows = [columns, ...getMatches().map(p => columns.map(k => p[k] ?? ''))];
    const csv = rows.map(row => row.map(val => `"${String(val).replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='francisco-dionisio-publications.csv';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  menuButton.addEventListener('click',()=>{
    const open = nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click',()=>{nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation');}));
  $('current-year').textContent = String(new Date().getFullYear());
  render();
})();
