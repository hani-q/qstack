/* ============================================================================
   Plan document behaviour — v1
   ----------------------------------------------------------------------------
   Everything here is progressive. With JavaScript disabled the document still
   reads top to bottom; it only loses numbering, the spine, and tab switching
   (all panels show instead).

   What it does
     · numbers every sheet (§1, §2 …) and every clause (§1.1, §1.2 …)
     · builds the spine from the sheets, then tracks reading position
     · makes each clause reference copy a deep link
     · opens eli asides on tap, dismisses on Escape, flips ones near the edge
     · drives tabsets
     · inks each status stamp once, when its sheet is first read
     · toggles print ⇄ vellum and remembers the choice
     · reserves text height with pretext, when pretext.js is loaded

   Authoring contract — see README.md
     <section class="sheet" id="…" data-title="…" data-status="locked">
   ========================================================================= */

(() => {
  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STATUS_LABEL = {
    locked: 'Locked',
    open: 'Open',
    deferred: 'Deferred',
    gate: 'Gate',
    ref: 'Reference',
  };

  /* -- Numbering --------------------------------------------------------- */

  const sheets = [...doc.querySelectorAll('.sheet')];

  sheets.forEach((sheet, index) => {
    const number = index + 1;
    sheet.dataset.number = String(number);

    const mark = sheet.querySelector('.sheet-mark .num');
    if (mark && !mark.textContent.trim()) mark.textContent = `§${number}`;

    sheet.querySelectorAll('.clause').forEach((clause, clauseIndex) => {
      const ref = clause.dataset.ref || `${number}.${clauseIndex + 1}`;
      const id = clause.id || `s${ref.replace(/\./g, '-')}`;
      clause.id = id;

      if (clause.querySelector('.clause-ref')) return;
      const anchor = doc.createElement('a');
      anchor.className = 'clause-ref';
      anchor.href = `#${id}`;
      anchor.textContent = `§${ref}`;
      anchor.setAttribute('aria-label', `Copy a link to clause ${ref}`);
      clause.prepend(anchor);
    });
  });

  /* -- Spine ------------------------------------------------------------- */

  const spineNav = doc.querySelector('[data-spine]');

  if (spineNav && sheets.length) {
    for (const sheet of sheets) {
      const link = doc.createElement('a');
      link.className = 'spine-link';
      link.href = `#${sheet.id}`;
      link.dataset.status = sheet.dataset.status || 'ref';
      link.innerHTML =
        `<span class="num">${sheet.dataset.number.padStart(2, '0')}</span>` +
        `<i class="spine-tick"></i>` +
        `<span></span>`;
      link.lastElementChild.textContent = sheet.dataset.title || '';
      spineNav.append(link);
    }

    const links = [...spineNav.querySelectorAll('.spine-link')];
    const mark = (id) => {
      for (const link of links) {
        link.setAttribute('aria-current', String(link.hash === `#${id}`));
      }
    };

    // The sheet whose top has most recently crossed the reading line wins.
    const readingLine = () => window.innerHeight * 0.3;
    const trackPosition = () => {
      let current = sheets[0];
      for (const sheet of sheets) {
        if (sheet.getBoundingClientRect().top <= readingLine()) current = sheet;
      }
      mark(current.id);
    };

    let queued = false;
    addEventListener(
      'scroll',
      () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          trackPosition();
        });
      },
      { passive: true },
    );
    trackPosition();
  }

  /* -- Legend ------------------------------------------------------------ */

  const legend = doc.querySelector('[data-spine-legend]');
  if (legend) {
    const used = [
      ...new Set(sheets.map((sheet) => sheet.dataset.status || 'ref')),
    ];
    for (const status of used) {
      const row = doc.createElement('div');
      row.dataset.status = status;
      row.innerHTML = `<i></i><span></span>`;
      row.lastElementChild.textContent = STATUS_LABEL[status] || status;
      legend.append(row);
    }
  }

  /* -- Clause deep links ------------------------------------------------- */

  doc.addEventListener('click', (event) => {
    const ref = event.target.closest('.clause-ref');
    if (!ref) return;
    event.preventDefault();
    const url = `${location.origin}${location.pathname}${ref.getAttribute('href')}`;
    history.replaceState(null, '', ref.getAttribute('href'));
    navigator.clipboard?.writeText(url).then(
      () => {
        ref.classList.add('copied');
        setTimeout(() => ref.classList.remove('copied'), 1200);
      },
      () => {},
    );
  });

  /* -- Eli asides -------------------------------------------------------- */

  /* Hover and focus are pure CSS. This adds the tap — a touch reader has no
     hover — plus Escape to dismiss, and it flips a box that would otherwise
     run off the end of the line. */

  const elis = [...doc.querySelectorAll('.eli')];

  const closeElis = (except) => {
    for (const eli of elis) {
      if (eli === except || !eli.hasAttribute('data-open')) continue;
      eli.removeAttribute('data-open');
      eli.querySelector('.eli-mark')?.setAttribute('aria-expanded', 'false');
    }
  };

  for (const eli of elis) {
    const mark = eli.querySelector('.eli-mark');
    if (!mark) continue;

    mark.setAttribute('aria-expanded', 'false');

    mark.addEventListener('click', (event) => {
      event.stopPropagation();
      closeElis(eli);
      const open = eli.toggleAttribute('data-open');
      mark.setAttribute('aria-expanded', String(open));
    });
  }

  /* A box anchored past the midpoint of the measure would overflow the page;
     anchor those to the end edge instead. Runs once fonts have settled. */
  const alignElis = () => {
    for (const eli of elis) {
      const body = eli.querySelector('.eli-body');
      if (!body) continue;
      eli.removeAttribute('data-align');
      const box = body.getBoundingClientRect();
      if (box.right > doc.documentElement.clientWidth - 12) {
        eli.setAttribute('data-align', 'end');
      }
    }
  };

  if (elis.length) {
    addEventListener('load', alignElis);
    addEventListener('resize', alignElis, { passive: true });
    doc.addEventListener('click', () => closeElis());
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeElis();
    });
  }

  /* -- Tabsets ----------------------------------------------------------- */

  for (const tabset of doc.querySelectorAll('.tabset')) {
    const tabs = [...tabset.querySelectorAll('.tab')];

    const select = (tab) => {
      for (const other of tabs) {
        const selected = other === tab;
        other.setAttribute('aria-selected', String(selected));
        other.tabIndex = selected ? 0 : -1;
        const panel = doc.getElementById(other.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      }
    };

    tabset.addEventListener('click', (event) => {
      const tab = event.target.closest('.tab');
      if (tab) select(tab);
    });

    tabset.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(doc.activeElement);
      if (index < 0) return;
      const step =
        event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });

    select(
      tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ||
        tabs[0],
    );
  }

  /* -- Stamps ------------------------------------------------------------ */

  if (reduceMotion) {
    for (const sheet of sheets) sheet.classList.add('inked');
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('inked');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -18% 0px' },
    );
    for (const sheet of sheets) observer.observe(sheet);
  }

  /* -- Theme ------------------------------------------------------------- */

  const THEMES = ['print', 'vellum'];
  const stored = localStorage.getItem('plan-theme');
  if (THEMES.includes(stored)) root.dataset.theme = stored;

  doc.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'vellum' ? 'print' : 'vellum';
    root.dataset.theme = next;
    localStorage.setItem('plan-theme', next);
  });

  doc
    .querySelector('[data-print]')
    ?.addEventListener('click', () => window.print());

  /* -- Text height reservation (optional) -------------------------------- */

  const pretext = window.planPretext;
  if (!pretext) return;

  const targets = [...doc.querySelectorAll('[data-pretext]')];
  const handles = new Map();

  const measure = () => {
    for (const element of targets) {
      const style = getComputedStyle(element);
      handles.set(
        element,
        pretext.prepare(element.textContent.trim(), style.font),
      );
    }
  };

  const reserve = () => {
    for (const [element, handle] of handles) {
      const lineHeight = Number.parseFloat(
        getComputedStyle(element).lineHeight,
      );
      if (!element.clientWidth || !Number.isFinite(lineHeight)) continue;
      element.style.minHeight = `${Math.ceil(pretext.layout(handle, element.clientWidth, lineHeight).height)}px`;
    }
  };

  doc.fonts.ready
    .then(() => {
      measure();
      reserve();
      new ResizeObserver(reserve).observe(doc.body);
    })
    .catch(() => {});
})();
