/* ============================================================================
   Execution board — v1
   ----------------------------------------------------------------------------
   A second view of the plan document. It renders ./board.jsonl, the
   append-only log that agents append to while they execute the plan.

   Read-only, on purpose. No drag-and-drop, no POST, no write path of any kind:
   a card moves when an agent appends a line, never when a reader drags one.
   Card text arrives from a file an agent wrote, so every node here is built
   from createElement and text, and nothing is ever handed to innerHTML.

   What it does
     · switches plan ⇄ board on #board, and keeps back and forward working
     · scrolls a §ref into view itself, because the plan was hidden when the
       browser went looking for the clause
     · folds the log into epics, cards, owners, statuses, and the coordinator
     · resolves a depends_on naming a split parent to that split's children
     · reads related off shared refs and shared files, and stores nothing
     · draws one lane per epic and six columns per lane
     · flags a second coordinator, a claim race, a `moved` whose `from` missed,
       and points outside 1, 2, 3, 5, 8
     · re-fetches every 3 s while the board view is on screen
     · over file:// the fetch fails, so it names the serve command instead

   Authoring contract — see README.md
     <section class="board" id="board"> holding [data-board-lanes]
   ========================================================================= */

(() => {
  const doc = document;
  const root = doc.documentElement;

  // A plan document with no board markup is not an error. It has no board.
  const lanesHost = doc.querySelector('[data-board-lanes]');
  if (!lanesHost) return;

  const stateLine = doc.querySelector('[data-board-state]');
  const meter = doc.querySelector('[data-board-meter]');

  const COLUMN_LABEL = {
    backlog: 'Backlog',
    claimed: 'Claimed',
    'in-progress': 'In progress',
    review: 'Review',
    blocked: 'Blocked',
    done: 'Done',
  };
  const COLUMNS = Object.keys(COLUMN_LABEL);
  const STATUSES = new Set([...COLUMNS, 'split']);
  const CLOSED = new Set(['done', 'split']);
  // Fibonacci, capped, and closed: anything else is a size nobody set.
  const POINTS = new Set([1, 2, 3, 5, 8]);
  const RELATED_SHOWN = 3;
  const POLL_MS = 3000;

  const NO_BOARD =
    'No board yet. Run /qstack-plan-to-html to break this plan into cards.';
  const NOT_SERVED = 'Serve the plan to see the board: ./qstack/scripts/serve.sh';

  const list = (value) => (Array.isArray(value) ? value : []);
  const count = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;
  // An unsized card adds nothing to a total: 13 is not a size, it is a card
  // whose size nobody set, and adding it would report work nobody weighed.
  const sum = (cards) =>
    cards.reduce((total, card) => total + (card.sized ? card.points : 0), 0);
  const parse = (line) => {
    try { return JSON.parse(line); } catch { return null; }
  };

  /* -- The fold ---------------------------------------------------------- */

  /* Lines in file order, later events win. A line that will not parse, and an
     event naming a card no `created` declared, are counted and dropped. */
  const fold = (text) => {
    const epics = new Map();
    const cards = new Map();
    const actors = new Set();
    const holders = new Set();
    let unreadable = 0;

    /* Everything that changes one card's state. False means the board cannot
       use the event, and nothing here has run. */
    const move = (event, card) => {
      switch (event.event) {
        case 'claimed': {
          // Two claims with no `released` between them is a race. The earliest
          // ts keeps the card, and the loser is named so only that actor's
          // `released` can clear the flag later.
          const rival = card.owner !== event.actor ? card.owner : '';
          // `<=` and not `<`: ts has one-second resolution, so two claims can
          // carry the same stamp. A tie leaves the card with the incumbent.
          const held = rival && card.claimedAt <= event.ts;
          if (rival) {
            card.raceWith = held ? event.actor : rival;
            card.race = `Claim race, ${card.raceWith} lost`;
          }
          /* An incumbent keeps its status along with the card. Setting
             `claimed` here unconditionally would drag a card that is already
             in-progress back a column every time a stray claim arrived. */
          if (!held) {
            card.owner = event.actor || '';
            card.claimedAt = event.ts;
            card.status = 'claimed';
          }
          return true;
        }
        case 'moved':
          if (!STATUSES.has(event.to)) return false;
          /* A `from` that missed still applies: a bad write has to stay visible.
             An absent `from` is one of those writes — the loops require it. */
          if (event.from !== card.status) {
            card.drift.push(
              `Moved from ${card.status}, not ${event.from || '(none)'}`,
            );
          }
          card.status = event.to;
          return true;
        case 'released':
          /* The loser of a claim race releases to clear its own flag, never to
             take the card off the winner. Both loops say to append exactly
             this, and only the named loser's release counts. */
          if (event.actor && event.actor === card.raceWith) {
            card.race = '';
            card.raceWith = '';
            return true;
          }
          // Anyone else releasing has to be the owner. Show it when they are not.
          if (event.actor && card.owner && event.actor !== card.owner) {
            card.drift.push(`Released by ${event.actor}, not by ${card.owner}`);
            return true;
          }
          card.status = 'backlog';
          card.owner = '';
          card.claimedAt = '';
          card.race = '';
          card.raceWith = '';
          return true;
        case 'split':
          card.status = 'split';
          /* `into` is the whole point of the event: work a card depends on
             moves into these children, and a dependency on this card waits on
             them now. A split naming nobody leaves the card standing for
             itself, which is the old reading and the safe one. */
          card.into = list(event.into).filter(Boolean);
          return true;
        case 'note':
          return true;
        default:
          return false;
      }
    };

    // False for an event the board cannot use, which the caller then counts.
    const apply = (event) => {
      if (!event?.ts || !event.event) return false;

      /* One actor holds the whole board for the length of a run, and who holds
         it is a set of names rather than one, because a `stood-down` releases
         only the actor that wrote it. Two loops starting in the same second
         both append `coordinator`; the one standing second in the file stands
         down, and that has to leave the winner holding the board. */
      if (event.event === 'coordinator') {
        if (!event.actor) return false;
        holders.add(event.actor);
        return true;
      }

      if (event.event === 'stood-down') {
        // An actor holding nothing has nothing to hand back, so its stand-down
        // is a bad write, counted with the lines that will not parse.
        if (!event.actor || !holders.delete(event.actor)) return false;
        return true;
      }

      if (event.event === 'epic') {
        if (!event.epic) return false;
        epics.set(event.epic, event.title || event.epic);
        return true;
      }

      if (event.event === 'created') {
        if (!event.card) return false;
        cards.set(event.card, {
          id: event.card,
          epic: event.epic || '',
          title: event.title || event.card,
          points: Number(event.points) || 0,
          refs: list(event.refs),
          files: list(event.files),
          dependsOn: list(event.depends_on),
          splitFrom: event.split_from || '',
          // Below this line is fold state rather than a `created` field.
          status: 'backlog', owner: '', claimedAt: '', into: [],
          notes: [], race: '', raceWith: '', drift: [],
        });
        return true;
      }

      const card = cards.get(event.card);
      if (!card) return false;
      if (!move(event, card)) return false;
      /* A note rides on any event and carries the question a blocked card waits
         on. It lands only once the event itself turned out to be usable, so a
         dropped line leaves nothing of itself behind. */
      if (event.note) card.notes.push(event.note);
      return true;
    };

    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      const event = parse(line);
      if (!apply(event)) {
        unreadable += 1;
        continue;
      }
      // Same rule as the note: an actor counts once its event was usable.
      if (event.actor) actors.add(event.actor);
    }

    /* A child of a split carries the parent's own depends_on. The loops write
       it that way; the fold adds it back when a line left it out, so splitting
       a card can never drop an ordering constraint the parent was still under.
       A chain of splits inherits all the way up, and a split_from cycle stops
       at the first id the walk has already read. */
    for (const card of cards.values()) {
      const deps = new Set(card.dependsOn);
      const seen = new Set([card.id]);
      let parent = cards.get(card.splitFrom);
      while (parent && !seen.has(parent.id)) {
        seen.add(parent.id);
        for (const dep of parent.dependsOn) deps.add(dep);
        parent = cards.get(parent.splitFrom);
      }
      card.dependsOn = [...deps];
    }

    /* A depends_on naming a card that later split waits on that split's
       children, never on the parent. The parent closed the moment it split,
       but the work it was holding went into the children, and a downstream card
       that starts there starts on top of work still running. A child that split
       again resolves onward, and an id already expanded is not expanded twice,
       so a split naming its own parent stops instead of running forever. */
    const resolve = (ids) => {
      const out = new Set();
      const seen = new Set();
      const walk = (id) => {
        if (seen.has(id)) return;
        seen.add(id);
        const card = cards.get(id);
        if (card?.status === 'split' && card.into.length) {
          for (const child of card.into) walk(child);
          return;
        }
        out.add(id);
      };
      for (const id of ids) walk(id);
      return [...out];
    };
    for (const card of cards.values()) card.needs = resolve(card.dependsOn);

    /* depends_on is stored one way. Reverse the resolved set, not the written
       one, so a parent's dependents show up on the children that now carry the
       work rather than on a card that is already closed. */
    const blocks = new Map();
    for (const card of cards.values()) {
      for (const dep of card.needs) {
        blocks.set(dep, [...(blocks.get(dep) || []), card.id]);
      }
    }

    /* Related is computed here and stored nowhere: two cards are related when
       they share a refs clause or a files path. Refs and files are indexed
       apart so a file called 7.2 cannot read as clause §7.2, and a ref is
       matched on its number, the way the §link on the card is written. */
    const keysOf = (card) => [
      ...card.refs.map((ref) => `ref ${String(ref).replace(/^§/, '')}`),
      ...card.files.map((file) => `file ${file}`),
    ];
    const shared = new Map();
    for (const card of cards.values()) {
      for (const key of keysOf(card)) {
        shared.set(key, [...(shared.get(key) || []), card.id]);
      }
    }

    for (const card of cards.values()) {
      card.blocks = blocks.get(card.id) || [];
      // Unfinished dependencies leave a card waiting in backlog. That is not
      // `blocked`, which is kept for a stall only a human can clear.
      card.waiting = card.needs.filter(
        (dep) =>
          card.status === 'backlog' && !CLOSED.has(cards.get(dep)?.status),
      );
      /* Points outside the closed set are a bad write, so the card is flagged
         and it never reads as ready. It stays on the board: dropping it would
         hide the one thing worth seeing. */
      card.sized = POINTS.has(card.points);
      /* Related drops the card's own ordering edges, which already read on the
         card as "blocks" and "Waiting on": the same id a second time under
         related is a word that says nothing. A split parent and its children
         stay, because sharing a clause is what related is about and neither
         card names the other as an edge. */
      const near = new Set();
      for (const key of keysOf(card)) {
        for (const id of shared.get(key) || []) near.add(id);
      }
      const edges = [card.id, ...card.dependsOn, ...card.needs, ...card.blocks];
      for (const id of edges) near.delete(id);
      card.related = [...near];
    }

    /* Both are read off the set once the whole file is folded, never carried
       along while it runs, so a stand-down partway through leaves no stale name
       and no stale fault. One holder reads as that actor, and none reads as
       nothing, which is the state between runs. More than one is what the rule
       forbids outright, so every holder is named in both places and the meter
       never says nobody holds a board somebody is running. */
    const holding = [...holders];
    const coordinator = holding.join(', ');
    const clash =
      holding.length > 1
        ? `${holding.length} coordinators, no stand-down: ${coordinator}`
        : '';

    return { epics, cards, actors, coordinator, clash, unreadable };
  };

  /* -- Drawing ----------------------------------------------------------- */

  /* A child is a node or a plain string, and a falsy child drops out, so an
     optional part of a card stays one expression. A string child becomes a text
     node, which is how card text is kept from carrying markup into the page. */
  const el = (tag, className, ...children) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    node.append(...children.filter(Boolean));
    return node;
  };

  /* A ref reads "§7.3", with or without the sign, and points at the id plan.js
     gives that clause: #s7-3. */
  const refLink = (ref) => {
    const number = String(ref).replace(/^§/, '');
    const link = el('a', '', `§${number}`);
    link.href = `#s${number.replace(/\./g, '-')}`;
    return link;
  };

  /* The size a card was given, which the stylesheet weights at 5 and 8 — the
     two that will cost a review round. */
  const points = (value) => {
    const node = el('span', 'board-card-points', String(value));
    node.dataset.points = String(value);
    return node;
  };

  /* Related runs long on a busy file, and a card has to stay one glance. Three
     names, then the count of the ones that did not fit. */
  const capped = (ids) => {
    const rest = ids.length - RELATED_SHOWN;
    return rest > 0
      ? `${ids.slice(0, RELATED_SHOWN).join(', ')} +${rest} more`
      : ids.join(', ');
  };

  const drawCard = (card) => {
    // One line per bad write, because a card can take more than one and the
    // second must not cover the first. The claim race, if any, reads first.
    const flags = [
      card.race,
      !card.sized && `Points ${card.points}, not 1, 2, 3, 5 or 8. Not ready.`,
      ...card.drift,
    ].filter(Boolean);
    // Related sits with the other facts rather than on a row of its own: it is
    // one more thing the card knows, not a second subject.
    const facts = [];
    if (card.files.length) facts.push(count(card.files.length, 'file'));
    if (card.splitFrom) facts.push(`from ${card.splitFrom}`);
    if (card.blocks.length) facts.push(`blocks ${card.blocks.join(', ')}`);
    if (card.related.length) facts.push(`related ${capped(card.related)}`);
    const notes = [
      card.waiting.length && `Waiting on ${card.waiting.join(', ')}`,
      card.notes[card.notes.length - 1],
    ].filter(Boolean);

    const node = el(
      'article', 'board-card',
      el(
        'p', 'board-card-head',
        el('span', 'board-card-id', card.id),
        card.points && points(card.points),
      ),
      el('p', 'board-card-title', card.title),
      card.refs.length && el('p', 'board-card-refs', ...card.refs.map(refLink)),
      (card.owner || facts.length) &&
        el(
          'p', 'board-card-meta',
          card.owner && el('span', 'board-card-owner', card.owner),
          facts.join(' · '),
        ),
      ...flags.map((text) => el('p', 'board-card-flag', text)),
      ...notes.map((note) => el('p', 'board-card-note', note)),
    );
    node.dataset.status = card.status;
    if (flags.length) node.dataset.flagged = 'true';
    return node;
  };

  // A split parent is closed, so it sits in the done column under its own status.
  const inColumn = (card, status) =>
    card.status === status || (status === 'done' && card.status === 'split');

  const drawLane = (id, title, cards) => {
    const cols = el('div', 'board-cols');
    for (const status of COLUMNS) {
      const held = cards.filter((card) => inColumn(card, status));
      const col = el(
        'div', 'board-col',
        el(
          'p', 'board-col-head',
          el('span', 'board-col-name', COLUMN_LABEL[status]),
          el('span', 'board-col-count', String(held.length)),
        ),
        ...held.map(drawCard),
      );
      col.dataset.status = status;
      cols.append(col);
    }
    // The lane carries its own points figure: a swimlane's size is the whole
    // reason the cards were weighted in the first place.
    const head = el(
      'div', 'board-lane-head',
      id && el('span', 'num', id),
      el('h3', '', title),
      el(
        'span', 'board-lane-points',
        `${sum(cards.filter((card) => CLOSED.has(card.status)))} / ${sum(cards)} pt`,
      ),
    );
    return el('section', 'board-lane', head, el('div', 'board-scroll', cols));
  };

  const show = (message, tone) => {
    if (!stateLine) return;
    stateLine.textContent = message;
    stateLine.hidden = !message;
    if (message) stateLine.dataset.tone = tone;
    else delete stateLine.dataset.tone;
  };

  const fill = (name, value) => {
    const slot = doc.querySelector(`[data-board-${name}]`);
    if (slot) slot.textContent = String(value);
  };

  const render = (board) => {
    const all = [...board.cards.values()];
    const closed = all.filter((card) => CLOSED.has(card.status));

    lanesHost.replaceChildren();
    for (const [id, title] of board.epics) {
      lanesHost.append(drawLane(id, title, all.filter((card) => card.epic === id)));
    }
    // A card naming an epic nobody declared lands here rather than nowhere.
    const loose = all.filter((card) => !board.epics.has(card.epic));
    if (loose.length) lanesHost.append(drawLane('', 'No epic', loose));

    /* A split parent's points leave both totals once it splits: the children
       carry that work now, and counting both counts it twice. This is the rule
       qstack-reflect states for the same numbers. */
    const counted = all.filter((card) => card.status !== 'split');
    fill('points-done', sum(counted.filter((card) => CLOSED.has(card.status))));
    fill('points-total', sum(counted));
    fill('cards-done', closed.length);
    fill('cards-total', all.length);
    fill('actors', board.actors.size);
    // Nobody holding the board is the state between runs, not a fault.
    fill('coordinator', board.coordinator || '—');
    // A board claimed but not yet broken down still has a coordinator to show.
    if (meter) meter.hidden = !all.length && !board.coordinator;

    // One line, whatever went wrong. Bad data outranks an empty board.
    const flagged = all.filter(
      (card) => card.race || card.drift.length || !card.sized,
    ).length;
    const faults = [];
    if (board.clash) faults.push(board.clash);
    if (board.unreadable) faults.push(count(board.unreadable, 'unreadable line'));
    if (flagged) faults.push(count(flagged, 'flagged card'));
    if (faults.length) show(faults.join(' · '), 'error');
    else show(all.length ? '' : NO_BOARD, 'warn');
  };

  /* -- The file ---------------------------------------------------------- */

  let lastText = null;
  let timer = 0;
  /* Switching views twice while a fetch is in flight would leave two request
     chains running: each schedules its own timeout, one handle overwrites the
     other, and the older response can repaint over the newer one. Every load
     carries the generation it started in, and a stale one does nothing. */
  let generation = 0;

  const boardVisible = () =>
    root.dataset.view === 'board' && doc.visibilityState === 'visible';

  const stopPolling = () => {
    clearTimeout(timer);
    timer = 0;
    generation += 1;
  };

  /* Poll only while the board is on screen, and skip the redraw when the file
     comes back byte for byte the same: no change is the common case, and a
     rebuilt lane loses its scroll position. */
  const load = () => {
    stopPolling();
    const mine = generation;
    fetch('./board.jsonl', { cache: 'no-store' })
      .then((response) => (response.ok ? response.text() : ''))
      .then((text) => {
        if (mine !== generation) return;
        // A 404 folds to no cards, and no cards already says "No board yet".
        if (text === lastText) return;
        lastText = text;
        render(fold(text));
      })
      .catch(() => {
        if (mine !== generation) return;
        // file:// rejects the fetch outright, and so does a dead connection.
        lastText = null;
        show(NOT_SERVED, 'warn');
      })
      .finally(() => {
        if (mine === generation && boardVisible()) {
          timer = setTimeout(load, POLL_MS);
        }
      });
  };

  /* -- Views ------------------------------------------------------------- */

  /* Anything that is not exactly "#board" is the plan, so a deep link like
     #s7-3 opens the plan and lets the browser scroll to the clause. */
  const viewOf = (hash) => (hash === '#board' ? 'board' : 'plan');
  const switchLinks = [...doc.querySelectorAll('[data-view-switch] a[href^="#"]')];

  const applyView = (view) => {
    root.dataset.view = view;
    for (const link of switchLinks) {
      link.setAttribute('aria-current', String(viewOf(link.hash) === view));
    }
    if (view === 'board') load();
    else stopPolling();
  };

  /* The two hashes the switch owns name a view, not a place inside one, so
     neither ever scrolls: clicking Plan keeps the reader where they were. */
  const viewHashes = new Set(switchLinks.map((link) => link.hash));

  /* Clicking a §ref from the board hands the browser a clause that is still
     display:none, so it scrolls to a box that is not there and lands at the
     top of the page. The scroll happens here instead, once the plan view is
     actually on. scrollIntoView with no argument inherits scroll-behavior from
     the stylesheet, which is smooth and turns instant under reduced motion. */
  const openHash = (hash) => {
    applyView(viewOf(hash));
    if (viewHashes.has(hash) || hash.length < 2) return;
    const target = doc.getElementById(hash.slice(1));
    if (target) target.scrollIntoView();
  };

  for (const link of switchLinks) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const hash = link.getAttribute('href');
      if (location.hash !== hash) history.pushState(null, '', hash);
      applyView(viewOf(link.hash));
    });
  }

  addEventListener('hashchange', () => openHash(location.hash));
  doc.addEventListener('visibilitychange', () => {
    if (boardVisible()) load();
    else stopPolling();
  });

  /* A load can land on a clause too, and plan.js only gives the clause its id
     a moment ago, so the browser's own look for the fragment may already have
     missed it. Same call, same repair. */
  openHash(location.hash);
})();
