(() => {
  const LESSONS = [
    { id: 0,  num: '00', kind: 'intro', title: 'סרטון המבוא', term: 'INTRODUCTION', yt: 'Wq3JAyT-N2I', desc: 'סרטון הפתיחה של האקדמיה — מה כולל הקורס, איך בנויים השיעורים ואיך מתרגלים נכון בבית. הצעד הראשון לפני שיעור 01.' },
    { id: 1,  num: '01', title: 'עמידת קרב', term: 'STANCE', yt: 'mlmJwV4OIf8', desc: 'הבסיס לכל טכניקה. איפה הרגליים, איפה הידיים ואיך נשארים יציבים גם כשזזים.' },
    { id: 2,  num: '02', title: 'ג׳אב', term: 'JAB', yt: 'XMmUtNV4F74', desc: 'אגרוף ישר ומהיר מהיד הקדמית. משמש למדידת טווח, לעצירת היריב ולהכנת התקפות נוספות.' },
    { id: 3,  num: '03', title: 'קרוס', term: 'CROSS', yt: 'JZQsmmTS4Rw', desc: 'אגרוף ישר מהיד האחורית. הכוח מגיע מסיבוב האגן והרגל האחורית, לא מהכתף.' },
    { id: 4,  num: '04', title: 'הוק קדמי', term: 'LEAD HOOK', yt: 'HFCxTpZZkhY', desc: 'אגרוף מעגלי קצר מהיד הקדמית. מיועד לטווח קרוב, מסביב להגנה של היריב.' },
    { id: 5,  num: '05', title: 'הוק אחורי', term: 'REAR HOOK', yt: 'E4IsbbwXeWg', desc: 'אותה תנועה מהיד האחורית, עם סיבוב גוף מלא. האגרוף החזק בסדרה.' },
    { id: 6,  num: '06', title: 'אפרקאט', term: 'UPPERCUT', yt: 'z7qrFHCpyIY', desc: 'אגרוף מלמטה למעלה בטווח קרוב. חודר בין הידיים כשההגנה סגורה.' },
    { id: 7,  num: '07', title: 'הגנה חזיתית', term: 'BLOCK', yt: 'M63-Plab3Ns', desc: 'חסימה וקליטה של אגרופים ישרים. הידיים גבוהות, המבט קדימה, הגוף ממשיך לנוע.' },
    { id: 8,  num: '08', title: 'הגנה מהוקים', term: 'HOOK DEFENSE', yt: 'HbtUMGtDoMo', desc: 'כיסוי הצדדים והראש מול אגרופים מעגליים, ויציאה מיידית להתקפה נגדית.' },
    { id: 9,  num: '09', title: 'בעיטות בסיס', term: 'KICKS', yt: '7wtKoSV0nOo', desc: 'בעיטות היסוד — נקודת המגע, סיבוב הרגל התומכת וחזרה מהירה לעמידת קרב.' },
    { id: 10, num: '10', title: 'תרגול מסכם', term: 'COMBINATION', yt: 'GYUrn0hUbmI', desc: 'חיבור של כל מה שנלמד לסדרה אחת רציפה. תרגול שאפשר לחזור עליו בכל אימון.' },
  ];

  const GROUPS = [
    { letter: 'א׳', title: 'עמידה ואגרופים ישרים', hint: 'הבסיס שכל השאר נשען עליו', ids: [1, 2, 3] },
    { letter: 'ב׳', title: 'אגרופים בטווח קרוב', hint: 'כשהמרחק נסגר וההגנה סגורה', ids: [4, 5, 6] },
    { letter: 'ג׳', title: 'הגנה ובעיטות', hint: 'לקלוט מכה נכון, ולהוסיף את הרגליים', ids: [7, 8, 9] },
  ];

  const state = {
    watched: loadWatched(),
    activeId: null,
    open: false,
    menuOpen: false,
    returnEl: null,
    watchTimer: null,
    prevOverflow: null,
    prevBodyOverflow: null,
    prevPadLeft: null,
  };

  function loadWatched() {
    try {
      const raw = localStorage.getItem('msa.progress.v1');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number') : [];
    } catch (_) { return []; }
  }

  function persist() {
    try { localStorage.setItem('msa.progress.v1', JSON.stringify(state.watched)); } catch (_) {}
  }

  function markWatched(id) {
    if (state.watched.indexOf(id) >= 0) return;
    state.watched = state.watched.concat([id]);
    persist();
    renderProgress();
    renderCards();
  }

  function toggleWatched(id) {
    const has = state.watched.indexOf(id) >= 0;
    state.watched = has ? state.watched.filter((n) => n !== id) : state.watched.concat([id]);
    persist();
    renderProgress();
    renderCards();
    if (state.open && state.activeId === id) renderModal();
  }

  function ytThumb(yt) { return 'https://i.ytimg.com/vi/' + yt + '/maxresdefault.jpg'; }

  function ytEmbed(yt) {
    return 'https://www.youtube.com/embed/' + yt + '?autoplay=1&rel=0&playsinline=1&hl=he&cc_lang_pref=he';
  }

  function svgPlay() {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M7 4.5l13 7.5-13 7.5z"></path></svg>';
  }

  function svgCheck() {
    return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"></path></svg>';
  }

  function cardHTML(l) {
    const watched = state.watched.indexOf(l.id) >= 0;
    const aria = l.kind === 'intro' ? 'נגן את סרטון המבוא' : 'נגן שיעור ' + l.num + ' — ' + l.title;
    const alt = l.kind === 'intro' ? 'פריים מתוך סרטון המבוא' : 'פריים מתוך שיעור ' + l.num + ' — ' + l.title;
    return (
      '<article data-msa="card" data-open-lesson="' + l.id + '" role="button" tabindex="0" aria-label="' + escapeAttr(aria) + '" style="position:relative;display:flex;flex-direction:column;background:var(--bg-surface);border:1px solid var(--white-a08);border-radius:var(--radius-md);overflow:hidden;cursor:pointer">' +
        '<div data-msa="thumb" style="position:relative;aspect-ratio:16/9;overflow:hidden;background:#000">' +
          '<img data-msa="thumbimg" data-yt-fallback src="' + ytThumb(l.yt) + '" alt="' + escapeAttr(alt) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;filter:saturate(0.75) contrast(1.06);transition:transform var(--dur-slow) var(--ease-out)">' +
          '<div aria-hidden="true" style="position:absolute;inset:0;background:linear-gradient(to top,rgba(5,5,6,0.9) 0%,rgba(5,5,6,0.3) 48%,rgba(5,5,6,0.1) 100%)"></div>' +
          '<span data-msa="num" aria-hidden="true" style="position:absolute;top:8px;inset-inline-start:14px;font-family:var(--font-display);font-weight:700;font-size:44px;line-height:0.9;color:var(--accent);transition:color var(--dur-fast) var(--ease-out);text-shadow:0 2px 20px rgba(0,0,0,0.75)">' + l.num + '</span>' +
          '<span data-msa="play" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:rgba(5,5,6,0.5);border:2px solid rgba(255,255,255,0.5);color:var(--white)">' + svgPlay() + '</span>' +
          (watched ? ('<span title="הושלם" style="position:absolute;top:12px;inset-inline-end:12px;width:26px;height:26px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:var(--accent);color:var(--white)">' + svgCheck() + '</span>') : '') +
        '</div>' +
        '<div data-msa="cardbody" style="display:flex;flex-direction:column;gap:5px;padding:18px 22px 20px;flex:1 1 auto">' +
          '<div dir="ltr" style="text-align:right;font-family:var(--font-body);font-weight:700;font-size:11px;letter-spacing:0.18em;color:var(--text-faint)">' + l.term + '</div>' +
          '<h4 data-msa="cardtitle" style="margin:0;font-family:var(--font-display-he);font-weight:700;font-size:33px;line-height:1.02;letter-spacing:-0.01em;color:var(--white)">' + l.title + '</h4>' +
        '</div>' +
      '</article>'
    );
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderCards() {
    const container = document.getElementById('lessonGroups');
    if (!container) return;
    let html = '';
    GROUPS.forEach((g) => {
      html += '<div data-anim style="margin-top:clamp(38px,5vw,68px)">';
      html += '<div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:16px;margin-bottom:20px">' +
                '<span style="font-family:var(--font-display-he);font-weight:700;font-size:33px;line-height:0.9;color:var(--accent)">' + g.letter + '</span>' +
                '<h3 style="margin:0;font-family:var(--font-display-he);font-weight:700;font-size:clamp(26px,2.6vw,33px);line-height:1.04;letter-spacing:-0.01em;white-space:nowrap;color:var(--white)">' + g.title + '</h3>' +
                '<span aria-hidden="true" style="flex:1 1 40px;height:1.5px;background:var(--rule-accent)"></span>' +
                '<span data-msa="grouphint" style="flex:0 0 auto;white-space:nowrap;font-family:var(--font-body);font-size:13px;color:var(--text-muted)">' + g.hint + '</span>' +
              '</div>';
      html += '<div data-msa="lessongrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:clamp(14px,1.6vw,22px)">';
      g.ids.forEach((id) => { html += cardHTML(LESSONS[id]); });
      html += '</div></div>';
    });
    container.innerHTML = html;
    armReveals();
    updateFinaleCheck();
  }

  function updateFinaleCheck() {
    const done = state.watched.indexOf(10) >= 0;
    const el = document.getElementById('finaleCheck');
    if (!el) return;
    if (done) { el.hidden = false; el.style.display = 'flex'; }
    else { el.hidden = true; el.style.display = 'none'; }
  }


  function renderProgress() {
    const done = LESSONS.filter((l) => l.kind !== 'intro' && state.watched.indexOf(l.id) >= 0).length;
    document.getElementById('progressLabel').textContent = done + '/10';
    document.getElementById('progressBar').style.width = (done * 10) + '%';
    const continueBtn = document.getElementById('continueBtn');
    const resetBtn = document.getElementById('resetBtn');
    if (done > 0) {
      continueBtn.querySelector('span') ? (continueBtn.querySelector('span').textContent = 'המשך מהשיעור הבא') : (continueBtn.textContent = 'המשך מהשיעור הבא');
      resetBtn.hidden = false;
    } else {
      continueBtn.textContent = 'התחילו משיעור 01';
      resetBtn.hidden = true;
    }
    updateFinaleCheck();
  }

  function nextUnwatched() {
    const data = LESSONS;
    return data.find((d) => state.watched.indexOf(d.id) < 0) || data[0];
  }

  function lockScroll() {
    const d = document.documentElement;
    const b = document.body;
    state.prevOverflow = d.style.overflow;
    state.prevBodyOverflow = b.style.overflow;
    state.prevPadLeft = b.style.paddingLeft;
    const bar = window.innerWidth - d.clientWidth;
    d.style.overflow = 'hidden';
    b.style.overflow = 'hidden';
    if (bar > 0) b.style.paddingLeft = bar + 'px';
  }

  function unlockScroll() {
    if (state.prevOverflow === null) return;
    document.documentElement.style.overflow = state.prevOverflow || '';
    document.body.style.overflow = state.prevBodyOverflow || '';
    document.body.style.paddingLeft = state.prevPadLeft || '';
    state.prevOverflow = state.prevBodyOverflow = state.prevPadLeft = null;
  }

  function openLesson(id) {
    if (!state.open) {
      state.returnEl = document.activeElement;
      lockScroll();
    }
    state.activeId = id;
    state.open = true;
    state.menuOpen = false;
    closeMenuPanel();
    renderModal();
    document.getElementById('modalWrap').hidden = false;
    document.getElementById('modalWrap').style.display = 'flex';
    setTimeout(() => document.getElementById('modalPanel').focus(), 0);
    clearTimeout(state.watchTimer);
    state.watchTimer = setTimeout(() => markWatched(id), 20000);
  }

  function closeModal() {
    if (!state.open) return;
    clearTimeout(state.watchTimer);
    state.open = false;
    state.activeId = null;
    const wrap = document.getElementById('modalWrap');
    wrap.hidden = true;
    wrap.style.display = 'none';
    document.getElementById('modalIframe').src = '';
    unlockScroll();
    if (state.returnEl && state.returnEl.focus) {
      try { state.returnEl.focus({ preventScroll: true }); } catch (_) { state.returnEl.focus(); }
    }
    state.returnEl = null;
  }

  function renderModal() {
    const a = state.activeId != null ? LESSONS[state.activeId] : null;
    if (!a) return;
    document.getElementById('modalNum').textContent = a.num;
    document.getElementById('msa-modal-title').textContent = a.title;
    document.getElementById('modalTerm').textContent = a.term;
    document.getElementById('modalDesc').textContent = a.desc;
    const iframe = document.getElementById('modalIframe');
    iframe.src = ytEmbed(a.yt);
    iframe.title = (a.kind === 'intro' ? 'סרטון המבוא' : 'שיעור ' + a.num) + ' — ' + a.title;
    const prev = document.getElementById('modalPrev');
    const next = document.getElementById('modalNext');
    prev.disabled = a.id <= 0;
    prev.setAttribute('aria-disabled', prev.disabled ? 'true' : 'false');
    next.disabled = a.id >= LESSONS.length - 1;
    next.setAttribute('aria-disabled', next.disabled ? 'true' : 'false');
    const mark = document.getElementById('modalMark');
    const isWatched = state.watched.indexOf(a.id) >= 0;
    mark.classList.remove('ms-btn--primary', 'ms-btn--secondary');
    mark.classList.add(isWatched ? 'ms-btn--primary' : 'ms-btn--secondary');
    mark.querySelector('span').textContent = isWatched ? 'הושלם' : 'סמן כהושלם';
  }

  function trapKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    const panel = document.getElementById('modalPanel');
    const nodes = panel.querySelectorAll('a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])');
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const act = document.activeElement;
    if (e.shiftKey && (act === first || act === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && act === last) { e.preventDefault(); first.focus(); }
  }

  function toggleMenu() {
    state.menuOpen = !state.menuOpen;
    const panel = document.getElementById('menuPanel');
    const btn = document.getElementById('menuBtn');
    if (state.menuOpen) {
      panel.hidden = false;
      panel.style.display = 'flex';
      btn.setAttribute('aria-expanded', 'true');
    } else {
      closeMenuPanel();
    }
  }

  function closeMenuPanel() {
    state.menuOpen = false;
    const panel = document.getElementById('menuPanel');
    const btn = document.getElementById('menuBtn');
    panel.hidden = true;
    panel.style.display = 'none';
    btn.setAttribute('aria-expanded', 'false');
  }

  // Reveal-on-scroll
  let io;
  function armReveals() {
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    if (!('IntersectionObserver' in window)) return;
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.remove('msa-off'); io.unobserve(en.target); } });
      }, { threshold: 0 });
    }
    document.querySelectorAll('[data-anim]').forEach((el) => {
      if (el.dataset.armed) return;
      el.dataset.armed = '1';
      if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
        el.classList.add('msa-off');
        io.observe(el);
      }
    });
  }

  function updateScrollBar() {
    const bar = document.getElementById('scrollBar');
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + '%';
    document.querySelectorAll('[data-anim].msa-off').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.remove('msa-off');
    });
  }

  function wireStaticThumbFallback() {
    document.querySelectorAll('img[data-yt-fallback]').forEach(bindFallback);
  }
  function bindFallback(img) {
    if (img.dataset.fbBound) return;
    img.dataset.fbBound = '1';
    img.addEventListener('error', () => {
      if (img.dataset.fb) return;
      img.dataset.fb = '1';
      img.src = img.src.replace('/maxresdefault.jpg', '/hqdefault.jpg');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderCards();
    renderProgress();
    wireStaticThumbFallback();
    // wire delegated fallback for newly-rendered thumbs
    document.querySelectorAll('img[data-yt-fallback]').forEach(bindFallback);
    armReveals();

    // Splash removal
    setTimeout(() => {
      const s = document.querySelector('[data-msa=splash]');
      if (s && s.parentNode) s.parentNode.removeChild(s);
    }, 2400);

    // Click delegation for lesson cards / finale / intro tile
    document.body.addEventListener('click', (e) => {
      const openEl = e.target.closest && e.target.closest('[data-open-lesson]');
      if (openEl) {
        e.preventDefault();
        const id = parseInt(openEl.getAttribute('data-open-lesson'), 10);
        if (!Number.isNaN(id)) openLesson(id);
        return;
      }
    });

    // Keyboard: cards + finale (Enter/Space)
    document.body.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const openEl = e.target.closest && e.target.closest('[data-open-lesson][role="button"]');
      if (openEl) {
        e.preventDefault();
        const id = parseInt(openEl.getAttribute('data-open-lesson'), 10);
        if (!Number.isNaN(id)) openLesson(id);
      }
    });

    // Header buttons
    document.getElementById('menuBtn').addEventListener('click', toggleMenu);
    document.querySelectorAll('#menuPanel [data-menu-link]').forEach((a) => {
      a.addEventListener('click', () => closeMenuPanel());
    });

    // Progress panel
    document.getElementById('continueBtn').addEventListener('click', () => {
      const done = LESSONS.filter((l) => l.kind !== 'intro' && state.watched.indexOf(l.id) >= 0).length;
      openLesson(done > 0 ? nextUnwatched().id : 1);
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
      state.watched = [];
      persist();
      renderProgress();
      renderCards();
    });

    // Modal wiring
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalWrap').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('modalPanel').addEventListener('keydown', trapKey);
    document.getElementById('modalPrev').addEventListener('click', () => {
      if (state.activeId != null && state.activeId > 0) openLesson(state.activeId - 1);
    });
    document.getElementById('modalNext').addEventListener('click', () => {
      if (state.activeId != null && state.activeId < LESSONS.length - 1) openLesson(state.activeId + 1);
    });
    document.getElementById('modalMark').addEventListener('click', () => {
      if (state.activeId != null) toggleWatched(state.activeId);
    });

    // Scroll listeners
    window.addEventListener('scroll', updateScrollBar, { passive: true });
    updateScrollBar();

    // Escape closes modal (global)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.open) closeModal();
    });
    // Resize closes mobile menu when going wide
    window.addEventListener('resize', () => {
      if (state.menuOpen && window.innerWidth > 860) closeMenuPanel();
    });

    // Glossary PDF modal
    const openPdf = () => {
      pdfReturnEl = document.activeElement;
      lockScroll();
      pdfOpen = true;
      const iframe = document.getElementById('pdfIframe');
      // Set src on demand to avoid loading the PDF on page load
      iframe.src = 'assets/glossary.pdf#view=FitH';
      const wrap = document.getElementById('pdfWrap');
      wrap.hidden = false;
      wrap.style.display = 'flex';
      setTimeout(() => document.getElementById('pdfPanel').focus(), 0);
    };
    const closePdf = () => {
      if (!pdfOpen) return;
      pdfOpen = false;
      const wrap = document.getElementById('pdfWrap');
      wrap.hidden = true;
      wrap.style.display = 'none';
      document.getElementById('pdfIframe').src = '';
      unlockScroll();
      if (pdfReturnEl && pdfReturnEl.focus) {
        try { pdfReturnEl.focus({ preventScroll: true }); } catch (_) { pdfReturnEl.focus(); }
      }
      pdfReturnEl = null;
    };
    document.getElementById('openGlossaryBtn').addEventListener('click', openPdf);
    document.getElementById('openGlossaryTile').addEventListener('click', openPdf);
    document.querySelectorAll('[data-open-glossary]').forEach((el) => {
      el.addEventListener('click', (e) => { e.preventDefault(); openPdf(); });
    });
    document.getElementById('pdfClose').addEventListener('click', closePdf);
    document.getElementById('pdfWrap').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closePdf();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pdfOpen) closePdf();
    });
  });

  let pdfOpen = false;
  let pdfReturnEl = null;
})();
