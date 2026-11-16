/* Itqān · Website: Bewegung beim Scrollen. Reines JavaScript, keine Bibliothek, keine Verfolgung. */
(() => {
  'use strict';
  const D = document, R = D.documentElement;
  R.classList.remove('no-js'); R.classList.add('js');
  const $ = (s, e = D) => e.querySelector(s), $$ = (s, e = D) => [...e.querySelectorAll(s)];
  const klemm = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const breit = () => innerWidth > 960;
  const sicher = f => { try { f(); } catch (e) { console.warn(e); } };

  /* Hell und Dunkel */
  const KEY = 'itqan-site-thema';
  const thema = t => { R.dataset.theme = t; try { localStorage.setItem(KEY, t); } catch (e) {} };
  $('#thema')?.addEventListener('click', () => thema(R.dataset.theme === 'dunkel' ? 'hell' : 'dunkel'));

  /* Kopfzeile: Glas nach dem Start, weicht beim Runterscrollen */
  const kopf = $('.kopf'); let lastY = scrollY;
  const kopfPruefen = () => {
    const y = scrollY;
    kopf.classList.toggle('fest', y > 24);
    kopf.classList.toggle('weg', y > 520 && y > lastY + 4 && !kopf.contains(D.activeElement));
    if (y < lastY - 4) kopf.classList.remove('weg');
    lastY = y;
  };

  /* Erscheinen */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  $$('.rv, .stufen, .zeit').forEach(e => io.observe(e));

  /* Fortschritt einer hohen Szene, 0 bis 1 */
  const fortschritt = el => { const r = el.getBoundingClientRect(); return klemm(-r.top / Math.max(1, r.height - innerHeight)); };

  /* Held: Zeiger und Scrollen bewegen die Ebenen verschieden stark */
  const held = $('.held'), buehne = $('.buehne'), bogen = $('.held-bg .bogen'), schein = $('.held-bg .schein'), flug = $$('.fl');
  if (held && !ruhig) {
    held.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch' || !buehne) return;
      const r = buehne.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      buehne.style.setProperty('--ry', (-8 + x * 14).toFixed(2) + 'deg'); buehne.style.setProperty('--rx', (3 - y * 10).toFixed(2) + 'deg');
      flug.forEach(f => { const k = +f.dataset.t || 20; f.style.translate = `${(x * k).toFixed(1)}px ${(y * k).toFixed(1)}px`; });
    });
  }
  const heldRahmen = () => {
    if (!held || ruhig) return;
    const y = klemm(scrollY / innerHeight, 0, 1.4);
    if (bogen) bogen.style.transform = `translate(-50%, calc(-50% + ${y * 90}px)) scale(${1 + y * .06})`;
    if (schein) schein.style.transform = `translate(-50%, calc(-50% + ${y * 40}px))`;
    if (buehne) buehne.style.setProperty('--py', (-y * 46).toFixed(1) + 'px');
    flug.forEach(f => { const k = +f.dataset.s || 60; f.style.transform = `translateY(${(-y * k).toFixed(1)}px)`; });
  };

  /* Hadith: Wort für Wort */
  const had = $('.hadith');
  let hadW = [];
  if (had) {
    const ar = $('.had-ar', had), roh = ar.textContent.trim();
    ar.setAttribute('aria-label', roh);
    ar.innerHTML = roh.split(/\s+/).map(w => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    hadW = $$('.w', ar);
  }
  const hadRahmen = () => {
    if (!had) return;
    const p = ruhig ? 1 : fortschritt(had), n = hadW.length, ein = klemm((p - .12) / .52) * n;
    hadW.forEach((w, i) => { const an = i < ein; if (an && !w.classList.contains('an')) { w.classList.add('an', 'neu'); setTimeout(() => w.classList.remove('neu'), 900); } if (!an) w.classList.remove('an', 'neu'); });
    $('.had-pre', had).style.opacity = klemm(p * 12) * (1 - klemm((p - .86) * 10) * .6);
    $('.had-de', had).classList.toggle('an', p > .72);
    $('.had-q', had).classList.toggle('an', p > .8);
  };

  /* Tag: seitwärts durch die vier Schritte */
  const tag = $('.tag-szene'), bahn = $('.tag-bahn');
  const tagRahmen = () => {
    if (!tag || !bahn) return;
    if (!breit() || ruhig) { bahn.style.transform = ''; return; }
    const p = fortschritt(tag), schieb = Math.max(0, bahn.scrollWidth - innerWidth + 24);
    bahn.style.transform = `translate3d(${(-p * schieb).toFixed(1)}px,0,0)`;
    tag.style.setProperty('--p', p.toFixed(3));
  };

  /* Methode: das Handy wechselt mit dem Absatz */
  const mBlocks = $$('.meth-text .block'), mLagen = $$('.meth-phone .lage');
  if (mBlocks.length) {
    const mio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const i = mBlocks.indexOf(e.target);
      mLagen.forEach(l => l.classList.toggle('an', +l.dataset.i === i));
    }), { rootMargin: '-45% 0px -45% 0px' });
    mBlocks.forEach(b => mio.observe(b));
  }

  /* Lichtkarte */
  const kScene = $('.karte-szene'), lk = $('.lk');
  const zellen = []; let lampe = null, stufeText = [], letztStufe = -1;
  if (lk) {
    let namen = []; try { namen = JSON.parse($('#suren').textContent); } catch (e) {}
    const info = $('.lk-info'), verse = lk.dataset.verse || '';
    for (let i = 0; i < 114; i++) {
      const z = D.createElement('div'); z.className = 'lk-z'; z.dataset.l = '0'; z.textContent = i + 1;
      const zeigen = () => { const n = namen[i]; if (!n) return; info.innerHTML = `<span class="ar" lang="ar">${n[0]}</span><span>${i + 1} · ${n[1]} · ${n[2]} ${verse}</span>`; info.classList.add('an'); };
      z.addEventListener('pointerenter', zeigen);
      lk.appendChild(z); zellen.push({ z, jit: Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1, l: 0 });
    }
    lk.addEventListener('pointerleave', () => { info.classList.remove('an'); lampe = null; lampeSetzen(); });
    lk.parentElement.addEventListener('pointermove', e => {
      const r = lk.getBoundingClientRect(); lampe = { x: e.clientX - r.left, y: e.clientY - r.top, cx: e.clientX, cy: e.clientY };
      lampeSetzen();
    });
    stufeText = $$('.karte-stufe [data-k]').map(e => e.dataset.k);
  }
  const STARTS = [.10, .265, .43, .595, .76];
  const kartePos = i => zellen[i].jit * .2 + i / 114 * .8;
  function lampeSetzen() { if (kScene) karteRahmen(true); }
  function karteRahmen(nurLampe) {
    if (!kScene || !lk) return;
    const p = ruhig ? 1 : fortschritt(kScene);
    const wrap = lk.parentElement;
    if (lampe) { wrap.style.setProperty('--mx', lampe.x + 'px'); wrap.style.setProperty('--my', lampe.y + 'px'); } else { wrap.style.setProperty('--mx', '-999px'); wrap.style.setProperty('--my', '-999px'); }
    for (let i = 0; i < zellen.length; i++) {
      const c = zellen[i]; let L = 0;
      for (let k = 0; k < 5; k++) if ((p - STARTS[k]) / .17 >= kartePos(i)) L = k + 1;
      if (lampe) {
        const r = c.z.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - lampe.cx, r.top + r.height / 2 - lampe.cy);
        const b = d < 56 ? 4 : d < 110 ? 3 : d < 170 ? 2 : 0; if (b > L) L = b;
      }
      if (c.l !== L) { c.l = L; c.z.dataset.l = L; }
    }
    if (nurLampe) return;
    let s = 0; for (let k = 0; k < 5; k++) if (p >= STARTS[k]) s = k + 1;
    if (s !== letztStufe) { letztStufe = s; $$('.karte-stufe [data-k]').forEach(e => { e.hidden = +e.dataset.k !== s; }); }
    $('.karte-ende')?.classList.toggle('an', p >= .95);
  }

  /* Vergleichsregler am Muṣḥaf */
  $$('.vergleich').forEach(v => {
    const bild = $('.bild', v), griff = $('.griff', v);
    const setze = x => { x = klemm(x, 3, 97); v.style.setProperty('--pos', x + '%'); griff.setAttribute('aria-valuenow', Math.round(x)); };
    const vonZeiger = e => { const r = bild.getBoundingClientRect(); setze((e.clientX - r.left) / r.width * 100); };
    let zieht = false;
    v.addEventListener('pointerdown', e => { zieht = true; v.setPointerCapture?.(e.pointerId); vonZeiger(e); v.dataset.benutzt = '1'; });
    v.addEventListener('pointermove', e => { if (zieht) vonZeiger(e); });
    ['pointerup', 'pointercancel'].forEach(t => v.addEventListener(t, () => { zieht = false; }));
    griff.addEventListener('keydown', e => {
      const a = +griff.getAttribute('aria-valuenow') || 50;
      if (e.key === 'ArrowLeft') { setze(a - 5); e.preventDefault(); } else if (e.key === 'ArrowRight') { setze(a + 5); e.preventDefault(); }
      else if (e.key === 'Home') { setze(3); e.preventDefault(); } else if (e.key === 'End') { setze(97); e.preventDefault(); }
    });
    setze(ruhig ? 50 : 96);
    if (!ruhig) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); const t0 = performance.now(); const f = t => { if (v.dataset.benutzt) return; const k = klemm((t - t0) / 1500), e = 1 - Math.pow(1 - k, 3); setze(96 - 46 * e); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); } }, { threshold: .55 }).observe(v);
  });

  /* Breites Bild kippt auf */
  const tab = $('.tablet');
  const tabRahmen = () => {
    if (!tab || ruhig) return;
    const r = tab.getBoundingClientRect(), k = klemm((innerHeight - r.top) / (innerHeight * .9));
    tab.style.setProperty('--kipp', (12 * (1 - k)).toFixed(2) + 'deg'); tab.style.setProperty('--sk', (.92 + .08 * k).toFixed(3));
  };

  /* Werkzeuge: Reiter */
  const reiter = $$('.reiter button'), werkLagen = $$('.werk-phone .lage');
  const reiterWahl = i => { reiter.forEach((b, j) => { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; }); werkLagen.forEach(l => l.classList.toggle('an', +l.dataset.i === i)); };
  reiter.forEach((b, i) => {
    b.addEventListener('click', () => reiterWahl(i));
    b.addEventListener('keydown', e => { const n = reiter.length; let j = i; if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n; else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + n) % n; else return; e.preventDefault(); reiter[j].focus(); reiterWahl(j); });
  });
  if (reiter.length) reiterWahl(0);

  /* Sprachen: Vorschau wechselt, solange niemand wählt */
  const sBtn = $$('.sprachen button'), sLagen = $$('.spr .lage');
  let sNr = 0, sTimer = null, sNutzer = false;
  const sprWahl = i => { sNr = i; sBtn.forEach((b, j) => b.setAttribute('aria-pressed', j === i)); sLagen.forEach(l => l.classList.toggle('an', +l.dataset.i === i)); };
  sBtn.forEach((b, i) => b.addEventListener('click', () => { sNutzer = true; clearInterval(sTimer); sprWahl(i); }));
  if (sBtn.length) {
    sprWahl(0);
    if (!ruhig) new IntersectionObserver(es => { clearInterval(sTimer); if (es[0].isIntersecting && !sNutzer) sTimer = setInterval(() => sprWahl((sNr + 1) % sBtn.length), 3600); }, { threshold: .4 }).observe($('.spr'));
  }

  /* Menü: aktueller Abschnitt */
  const links = $$('.menue a');
  const nio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => { if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const t = $(a.getAttribute('href')); if (t) nio.observe(t); });

  /* ein Rahmen pro Bild */
  let wartet = false;
  const rahmen = () => { wartet = false; sicher(kopfPruefen); sicher(heldRahmen); sicher(hadRahmen); sicher(tagRahmen); sicher(() => karteRahmen(false)); sicher(tabRahmen); };
  const plane = () => { if (!wartet) { wartet = true; requestAnimationFrame(rahmen); } };
  addEventListener('scroll', plane, { passive: true }); addEventListener('resize', plane);
  rahmen();
})();
