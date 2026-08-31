/* ============================================================================
   Execution board: v1
   ----------------------------------------------------------------------------
   A second view of the plan document. It renders ./board-events.js, the
   append-only event stream that agents append to while they execute the plan.

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
     · builds the status filter and the card dialog itself, so a plan written
       before either existed gets both from the stylesheet and this file
     · shows one status at a time when the filter is set, and hides a lane with
       nothing in that column
     · opens a card's whole record in a modal: every note, every flag, every
       relationship uncapped, and the card's own slice of the event stream
     · links a card to the execution.md sections it earned, from the anchor
       slugs the loop cited rather than from prose repeated onto the card
     · flags a second coordinator, a claim race, a `moved` whose `from` missed,
       and points outside 1, 2, 3, 5, 8
     · reloads the event script every 3 s while the board view is on screen
     · loads the same event script over http:// and file://

   Authoring contract: see README.md
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
  /* The ledger a card's reasoning is written into, and the shape of an anchor
     the board will build a link to. The event carries the slug alone and the
     board builds the path, so no event can put a scheme, a traversal or a
     `javascript:` URL into an href. Anything else is a bad write, and the card
     says so rather than linking somewhere nobody meant. */
  const LEDGER = 'execution.md';
  const SLUG = /^[a-z0-9][a-z0-9-]*$/;
  const POLL_MS = 3000;
  const FORMAT = 1;

  const NO_BOARD =
    'No board yet. Run /qstack-plan-to-html to break this plan into cards.';
  const BROKEN_BOARD =
    'Board event stream missing or invalid. Check its format header and run node --check board-events.js.';

  const list = (value) => (Array.isArray(value) ? value : []);
  const count = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;
  // An unsized card adds nothing to a total: 13 is not a size, it is a card
  // whose size nobody set, and adding it would report work nobody weighed.
  const sum = (cards) =>
    cards.reduce((total, card) => total + (card.sized ? card.points : 0), 0);
  /* -- The fold ---------------------------------------------------------- */

  /* Events in file order, later events win. A call whose value is not usable,
     and an event naming a card no `created` declared, are counted and dropped. */
  const fold = (events) => {
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
             An absent `from` is one of those writes: the loops require it. */
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
      if (event?.event === 'board' && event.format === FORMAT) return true;
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
          notes: [], race: '', raceWith: '', drift: [], entries: [],
          /* Every usable event that named this card, in file order. The column
             shows a summary; the dialog shows this. */
          log: [event],
        });
        return true;
      }

      const card = cards.get(event.card);
      if (!card) return false;
      if (!move(event, card)) return false;
      // Same rule as the note below: a dropped line leaves nothing behind.
      card.log.push(event);
      /* An `entry` cites the ledger section this event wrote, so the reasoning
         lives in execution.md once instead of there and on the card as well.
         The same section cited twice is one entry: a card that parked and
         resumed under one heading has one place to read, not two links to it. */
      if (event.entry) {
        const slug = String(event.entry);
        if (!SLUG.test(slug)) card.drift.push(`Entry "${slug}" is not an anchor`);
        else if (!card.entries.includes(slug)) card.entries.push(slug);
      }
      /* A note rides on any event and carries the question a blocked card waits
         on. It lands only once the event itself turned out to be usable, so a
         dropped line leaves nothing of itself behind. */
      if (event.note) card.notes.push(event.note);
      return true;
    };

    for (const event of events) {
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
      /* A card with no `files` reserves nothing: it collides with no other
         card and excludes none, so the ready set refuses it and the badge
         below must agree. The breakdown writes an empty array only on an `8`,
         which is never ready either, so this reads as a bad write anywhere
         else. */
      card.owns = card.files.length > 0;
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

  /* A link into the ledger beside the plan. It opens in its own tab: the board
     is polling, holds a filter and may have a card open, and none of that
     should be thrown away to read a paragraph. The column has room for the slug
     and the dialog has room for the path it sits in, so the caller says which;
     how each one looks is the stylesheet's to decide, by where the link landed.
  */
  const ledgerLink = (slug, full) => {
    const link = el('a', 'board-card-link', full ? `${LEDGER}#${slug}` : slug);
    link.href = `./${LEDGER}#${slug}`;
    link.target = '_blank';
    link.rel = 'noopener';
    return link;
  };

  /* The size a card was given, which the stylesheet weights at 5 and 8: the
     two heaviest sizes on the closed scale. */
  const points = (value) => {
    const node = el('span', 'board-card-points', String(value));
    node.dataset.points = String(value);
    return node;
  };

  const cardJump = (id, state = '') => {
    const button = el('button', 'board-card-link', id);
    button.type = 'button';
    button.dataset.boardCardJump = id;
    button.setAttribute('aria-label', `Show card ${id}`);
    if (state) button.dataset.state = state;
    return button;
  };

  /* One labelled row of chips, and the only place the row's shape is written.
     Ordering, the ledger and anything else a card points at all read the same
     way down the card, so they are all drawn by this. */
  const relationRow = (label, kind, ...chips) => {
    const shown = chips.filter(Boolean);
    if (!shown.length) return '';
    const row = el(
      'div', 'board-card-relation',
      el('span', 'board-card-relation-label', label),
      el('span', 'board-card-links', ...shown),
    );
    row.dataset.relation = kind;
    return row;
  };

  /* Relationships are the part of a card that determines work order, so they
     get rows and targets instead of sharing one metadata sentence. How many to
     show is the caller's: the column caps Related because it is useful context
     and never as important as ordering, and the dialog caps nothing. */
  const relation = (label, ids, kind, states = new Map(), cap = Infinity) => {
    const shown = ids.slice(0, cap);
    const rest = ids.length - shown.length;
    return relationRow(
      label, kind,
      ...shown.map((id) => cardJump(id, states.get(id))),
      rest > 0 && el('span', 'board-card-link-more', `+${rest}`),
    );
  };

  const ledgerRow = (slugs, full) =>
    relationRow('Ledger', 'ledger', ...slugs.map((slug) => ledgerLink(slug, full)));

  // One line per bad write, because a card can take more than one and the
  // second must not cover the first. The claim race, if any, reads first.
  // Read the same way in the column and in the dialog, so the two cannot drift.
  const flagsOf = (card) => [
    card.race,
    !card.sized && `Points ${card.points}, not 1, 2, 3, 5 or 8. Not ready.`,
    card.sized && !card.owns && 'No files. Not ready.',
    ...card.drift,
  ].filter(Boolean);

  /* Which of a card's needs it is still waiting on. Read in the column and in
     the dialog, so like the flags it is derived in one place. */
  const needStates = (card) =>
    new Map(card.needs.map((id) => [id, card.waiting.includes(id) ? 'waiting' : 'done']));

  /* The flags a caller already has are passed back in: a card that draws both
     would otherwise decide it was flagged twice over. */
  const readinessOf = (card, flags = flagsOf(card)) => {
    if (card.status === 'blocked') return 'blocked';
    if (card.status !== 'backlog') return '';
    if (card.waiting.length) return 'waiting';
    if (card.sized && card.owns && card.points !== 8 && !flags.length) return 'ready';
    return '';
  };

  const READINESS = { blocked: 'Blocked', waiting: 'Waiting', ready: 'Ready' };

  const badge = (state) => {
    const node = el('span', 'board-card-readiness', READINESS[state]);
    node.dataset.state = state;
    return node;
  };

  /* The id is the card's own control. Making the whole article a button would
     put the relationship buttons inside one, and giving every card a tab stop
     would put sixty of them between the filter and the first thing a reader
     wants. The id is already the card's name, so it is the thing to press. */
  const cardOpen = (id) => {
    const button = el('button', 'board-card-id', id);
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-label', `Card ${id} in full`);
    return button;
  };

  const drawCard = (card) => {
    const flags = flagsOf(card);
    const facts = [];
    if (card.files.length) facts.push(count(card.files.length, 'file'));
    const notes = [card.notes[card.notes.length - 1]].filter(Boolean);
    const readiness = readinessOf(card, flags);

    const node = el(
      'article', 'board-card',
      el(
        'p', 'board-card-head',
        cardOpen(card.id),
        readiness && badge(readiness),
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
      ledgerRow(card.entries),
      card.splitFrom && relation('From', [card.splitFrom], 'from'),
      relation('Needs', card.needs, 'needs', needStates(card)),
      relation('Unlocks', card.blocks, 'unlocks'),
      relation('Related', card.related, 'related', new Map(), RELATED_SHOWN),
    );
    node.id = `board-card-${card.id}`;
    node.tabIndex = -1;
    node.dataset.card = card.id;
    node.dataset.status = card.status;
    if (flags.length) node.dataset.flagged = 'true';
    return node;
  };

  lanesHost.addEventListener('click', (event) => {
    const jump = event.target.closest('[data-board-card-jump]');
    if (!jump) {
      /* The id button and anywhere else on the card reach the same call: the
         button carries the keyboard path and the accessible name, and the rest
         of the card is the mouse taking the shortcut. A §ref is the exception,
         because it already goes somewhere and opening the card on the way
         would leave a modal over the clause it just opened. */
      if (event.target.closest('a[href]')) return;
      const card = event.target.closest('.board-card');
      if (card) openDialog(card.dataset.card, card.querySelector('.board-card-id'));
      return;
    }
    const target = doc.getElementById(`board-card-${jump.dataset.boardCardJump}`);
    if (!target) return;
    const previous = lanesHost.querySelector('[data-focused]');
    if (previous) delete previous.dataset.focused;
    target.dataset.focused = 'true';
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    setTimeout(() => delete target.dataset.focused, 1800);
  });

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
      /* What the filter needs to know, written down by the pass that already
         worked it out. Asking the DOM for it again would tie a lane's
         visibility to the card markup's class name and nesting depth. */
      col.dataset.held = String(held.length);
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

  /* -- The status filter -------------------------------------------------- */

  /* A view control and nothing else: it hides columns, it never moves a card,
     and it appends nothing. One status at a time, because the question a
     reader arrives with is "what is running right now" rather than "which four
     of six columns interest me". `all` is the way back.

     Built here rather than in plan.html so a plan written before this release
     gets the control by loading the stylesheet and this script, with no edit to
     markup that was frozen when execution started. */

  // .board holds the meter, the state line, the filter, and the lanes. Without
  // it there is nowhere to hang the filter, and the board is lanes only.
  const boardHost = lanesHost.closest?.('.board') || null;
  const FILTERS = [['all', 'All'], ...COLUMNS.map((key) => [key, COLUMN_LABEL[key]])];
  // Per plan, because every plan opened from disk shares one null origin and a
  // filter set on one board is not a filter anybody asked for on another.
  const FILTER_KEY = `qstack-board-filter:${location.pathname}`;

  let filter = 'all';
  let filterBar = null;
  let chipHost = null;
  let emptyLine = null;

  /* Storage is off in a Safari file:// window and can be off anywhere else, and
     a board that will not draw because a preference would not load is a worse
     board than one that forgets the preference. */
  const remembered = () => {
    try {
      return globalThis.localStorage?.getItem(FILTER_KEY) || 'all';
    } catch {
      return 'all';
    }
  };
  const remember = (value) => {
    try {
      globalThis.localStorage?.setItem(FILTER_KEY, value);
    } catch { /* nothing to do: the filter still works for this visit */ }
  };

  /* Built once. Rebuilding the row on every poll would destroy the chip a
     reader had just tabbed to, and restart its transition three times a
     minute; only the counts and the pressed state change after this. */
  const ensureFilter = () => {
    if (chipHost || !boardHost) return;
    const stored = remembered();
    filter = FILTERS.some(([key]) => key === stored) ? stored : 'all';

    chipHost = el(
      'div', 'board-chips',
      ...FILTERS.map(([key, label]) => {
        const chip = el(
          'button', 'board-chip',
          el('span', 'board-chip-name', label),
          el('span', 'board-chip-count', '0'),
        );
        chip.type = 'button';
        chip.dataset.boardFilter = key;
        return chip;
      }),
    );
    emptyLine = el('p', 'board-filter-empty');
    emptyLine.hidden = true;
    filterBar = el('div', 'board-filter', el('span', 'label', 'Show'), chipHost, emptyLine);
    filterBar.setAttribute('role', 'group');
    filterBar.setAttribute('aria-label', 'Filter cards by status');
    boardHost.insertBefore(filterBar, lanesHost);

    chipHost.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-board-filter]');
      if (!chip) return;
      filter = chip.dataset.boardFilter;
      remember(filter);
      applyFilter();
    });
  };

  /* Counts on the chips, so the filter answers "is anything in review" before
     anyone presses it. One pass: `inColumn` folds a split parent into `done`,
     which is the same rule the columns are drawn under. A chip counting
     nothing still presses, because "empty" is an answer. */
  const paintFilter = (cards) => {
    if (!chipHost) return;
    /* A board with no cards has nothing to filter, and six chips reading 0
       beside "No board yet" answer a question nobody asked. */
    filterBar.hidden = !cards.length;
    const held = { all: cards.length };
    for (const card of cards) {
      for (const status of COLUMNS) {
        if (inColumn(card, status)) held[status] = (held[status] || 0) + 1;
      }
    }
    for (const chip of chipHost.children) {
      const n = held[chip.dataset.boardFilter] || 0;
      chip.querySelector('.board-chip-count').textContent = String(n);
      if (n) delete chip.dataset.empty;
      else chip.dataset.empty = 'true';
    }
  };

  /* Runs after every redraw as well as on every press: the poll replaces every
     lane, and a filter that survived the file but not the redraw would turn
     itself off every three seconds. The column list lives in COLUMNS and
     nowhere else, so hiding is decided here rather than restated as one CSS
     selector per status. */
  const applyFilter = () => {
    if (!chipHost) return;
    boardHost.dataset.filter = filter;
    for (const chip of chipHost.children) {
      chip.setAttribute('aria-pressed', String(chip.dataset.boardFilter === filter));
    }
    /* An epic's head over an empty row says only that the filter is on, which
       the chips said already. Hide the lane and keep the ones that answer. */
    let shown = 0;
    for (const lane of lanesHost.children) {
      let has = filter === 'all';
      for (const col of lane.querySelectorAll('.board-col')) {
        const wanted = filter === 'all' || col.dataset.status === filter;
        col.hidden = !wanted;
        if (wanted && Number(col.dataset.held)) has = true;
      }
      lane.hidden = !has;
      if (has) shown += 1;
    }
    const label = COLUMN_LABEL[filter] || filter;
    emptyLine.textContent = shown ? '' : `Nothing in ${label}.`;
    emptyLine.hidden = Boolean(shown);
  };

  /* -- The card dialog ---------------------------------------------------- */

  /* A card in a column is a summary, and it has to stay one: the column is 216
     pixels wide and the board is read across, not down. Everything the fold
     knows and the column drops — every note rather than the last, every
     relationship rather than the first three, and the card's own slice of the
     event stream — is one press away instead of gone. */

  let dialog = null;
  let dialogCard = '';
  let dialogShown = '';
  let dialogReturn = null;
  let latest = null;

  const field = (term, value) =>
    value ? el('div', 'board-field', el('dt', '', term), el('dd', '', value)) : '';

  const section = (label, ...parts) => {
    const body = parts.filter(Boolean);
    return body.length
      ? el('section', 'board-dialog-section', el('p', 'label', label), ...body)
      : '';
  };

  /* One line per event, in file order. `2026-08-29T19:43:09Z` reads as
     `08-29 19:43`: the year is the same on every line of a plan, and seconds
     are noise until two events tie, which the title attribute settles. */
  const moment = (event) => {
    const into = list(event.into);
    const detail = [
      event.from && event.to ? `${event.from} → ${event.to}` : event.to,
      into.length && `into ${into.join(', ')}`,
      event.reason,
      event.note,
    ].filter(Boolean).join(' · ');
    const row = el(
      'li', 'board-log-row',
      el('span', 'board-log-ts', String(event.ts || '').slice(5, 16).replace('T', ' ')),
      el('span', 'board-log-event', String(event.event || '')),
      el('span', 'board-log-actor', event.actor || ''),
      detail && el('span', 'board-log-detail', detail),
    );
    row.title = String(event.ts || '');
    return row;
  };

  /* What has to change before the open card is worth rebuilding. An event
     appended to some other card must not reset this one's scroll or take the
     focus off its close button, and on a running board that is most polls.

     The relationship sets are compared by their ids rather than by how many
     they hold, because `needs`, `blocks` and `related` are all derived from
     other cards: a dependency that splits rewrites this card's `needs` with no
     event on this card at all, and a card outside `backlog` has an empty
     `waiting` that cannot stand in for the change. Lengths also miss two edits
     that cancel out inside one poll. */
  const dialogState = (card) =>
    [card.status, card.owner, card.log.length, card.notes.length,
      card.entries.join(','), card.drift.length, card.waiting.join(','),
      card.needs.join(','), card.blocks.join(','), card.related.join(',')].join('|');

  const fillDialog = (card) => {
    const flags = flagsOf(card);
    const readiness = readinessOf(card, flags);
    const status = el('span', 'stamp', COLUMN_LABEL[card.status] || card.status);
    status.dataset.status = card.status;
    /* The stamp already names the status, so the badge earns its place only
       when it says something the stamp does not: a backlog card that is ready
       to claim, and one that is still waiting on work upstream. */
    const mark = readiness && readiness !== 'blocked' ? badge(readiness) : '';

    const close = el('button', 'doc-tool wide', 'CLOSE');
    close.type = 'button';
    close.dataset.boardDialogClose = 'true';
    close.setAttribute('aria-label', 'Close this card');

    const title = el('h3', 'board-dialog-title', card.title);
    title.id = 'board-dialog-title';

    dialog.dataset.status = card.status;
    dialogShown = dialogState(card);
    dialog.replaceChildren(
      el(
        'div', 'board-dialog-bar',
        el(
          'p', 'board-dialog-mark',
          el('span', 'num', card.id),
          status,
          mark,
          card.points && points(card.points),
        ),
        close,
      ),
      el(
        'div', 'board-dialog-body',
        title,
        el(
          'dl', 'board-dialog-fields',
          field('Epic', latest?.epics.get(card.epic) || card.epic || 'None'),
          field('Owner', card.owner || 'Unclaimed'),
          field('Points', card.sized ? String(card.points) : `${card.points} — off the scale`),
          field('From', card.splitFrom),
        ),
        section('Flagged', ...flags.map((text) => el('p', 'board-dialog-flag', text))),
        section(
          'Clauses',
          card.refs.length && el('p', 'board-dialog-refs', ...card.refs.map(refLink)),
        ),
        section(
          'Files',
          card.files.length &&
            el('ul', 'board-files', ...card.files.map((file) => el('li', '', file))),
        ),
        section(
          'Ledger',
          card.entries.length &&
            el('ul', 'board-files',
              ...card.entries.map((slug) => el('li', '', ledgerLink(slug, true)))),
        ),
        section(
          'Order',
          relation('Needs', card.needs, 'needs', needStates(card)),
          relation('Unlocks', card.blocks, 'unlocks'),
        ),
        /* Related is its own section rather than a third row under Order: it is
           the one relationship that controls nothing about work order, which is
           the whole reason the card draws it quieter. Bare chips under the
           header, the way Clauses and Files read: a row label here would only
           say "related" a second time. */
        section(
          'Related',
          card.related.length &&
            el('div', 'board-card-links', ...card.related.map((id) => cardJump(id))),
        ),
        section('Notes', ...card.notes.map((note) => el('p', 'board-dialog-note', note))),
        section('Log', card.log.length && el('ol', 'board-log', ...card.log.map(moment))),
      ),
    );
  };

  const openDialog = (id, from) => {
    const card = latest?.cards.get(id);
    if (!card || !boardHost) return;
    if (!dialog) {
      dialog = el('dialog', 'board-dialog');
      dialog.setAttribute('aria-labelledby', 'board-dialog-title');
      dialog.addEventListener('click', (event) => {
        // The dialog itself is the backdrop: the body covers everything else.
        if (event.target === dialog || event.target.closest('[data-board-dialog-close]')) {
          dialog.close();
          return;
        }
        // A relationship inside the dialog retargets it. Jumping to a card
        // behind a modal would scroll something the reader cannot see.
        const jump = event.target.closest('[data-board-card-jump]');
        if (jump) {
          openDialog(jump.dataset.boardCardJump);
          return;
        }
        // A §ref belongs to the plan, so the dialog gets out of its way and
        // lets the hash change do the rest.
        if (event.target.closest('a[href^="#"]')) dialog.close();
      });
      dialog.addEventListener('close', () => {
        dialogCard = '';
        dialogShown = '';
        if (dialogReturn?.isConnected) dialogReturn.focus();
        dialogReturn = null;
      });
      boardHost.append(dialog);
    }
    // Retargeting keeps the element that opened the first dialog, so closing
    // after three hops still lands the reader back on the card they pressed.
    if (from) dialogReturn = from;
    const retarget = dialogCard !== id;
    dialogCard = id;
    if (retarget || dialogState(card) !== dialogShown) fillDialog(card);
    if (!dialog.open) dialog.showModal();
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
    latest = board;
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
    fill('coordinator', board.coordinator || 'None');
    // A board claimed but not yet broken down still has a coordinator to show.
    if (meter) meter.hidden = !all.length && !board.coordinator;

    // One line, whatever went wrong. Bad data outranks an empty board.
    const flagged = all.filter(
      (card) => card.race || card.drift.length || !card.sized || !card.owns,
    ).length;
    const faults = [];
    if (board.clash) faults.push(board.clash);
    if (board.unreadable) faults.push(count(board.unreadable, 'unreadable line'));
    if (flagged) faults.push(count(flagged, 'flagged card'));
    if (faults.length) show(faults.join(' · '), 'error');
    else show(all.length ? '' : NO_BOARD, 'warn');

    // The filter is view state, so it is applied again over the lanes that just
    // replaced the ones it was applied to.
    ensureFilter();
    paintFilter(all);
    applyFilter();

    /* An open dialog outlives the redraw as well, and it is the one place on
       the board showing a card in full while an agent is working it. Refill it
       from the fold that just landed rather than leave it three seconds old. */
    if (dialogCard) {
      const card = board.cards.get(dialogCard);
      if (!card) dialog?.close();
      else if (dialogState(card) !== dialogShown) fillDialog(card);
    }
  };

  /* -- The file ---------------------------------------------------------- */

  let lastSignature = null;
  let timer = 0;
  /* Switching views twice while a script is loading would leave two request
     chains running. Every load carries the generation it started in, and the
     old script is removed before another one can collect events. */
  let generation = 0;
  let collecting = null;
  let active = null;

  /* board-events.js is data expressed as calls to this receiver. A classic
     script is a declared page resource, so browsers load it beside plan.html
     over file:// as well as HTTP. Keep the receiver fixed: every writer and
     every existing event line names it. */
  globalThis.qstackBoardEvent = (event) => {
    if (collecting) collecting.push(event);
  };

  const boardVisible = () =>
    root.dataset.view === 'board' && doc.visibilityState === 'visible';

  const stopPolling = () => {
    clearTimeout(timer);
    timer = 0;
    generation += 1;
    if (active) {
      removeEventListener('error', active.runtimeError);
      active.script.remove();
      active = null;
      collecting = null;
    }
  };

  /* Poll only while the board is on screen, and skip the redraw when the event
     values are unchanged: no change is the common case, and a rebuilt lane
     loses its scroll position. A new script element gives HTTP a cache-busting
     URL and gives file:// the same load path without fetch or CORS. */
  const load = () => {
    stopPolling();
    const mine = generation;
    const events = [];
    const script = doc.createElement('script');
    let failed = false;

    const runtimeError = (error) => {
      if (String(error.filename || '').includes('board-events.js')) failed = true;
    };
    const finish = () => {
      if (active?.script !== script) return;
      removeEventListener('error', runtimeError);
      script.remove();
      active = null;
      collecting = null;
      if (mine !== generation) return;

      if (events[0]?.event !== 'board' || events[0]?.format !== FORMAT) {
        failed = true;
      }
      if (failed) {
        lastSignature = null;
        show(BROKEN_BOARD, 'error');
      } else {
        const signature = JSON.stringify(events);
        if (signature !== lastSignature) {
          lastSignature = signature;
          render(fold(events));
        }
      }
      if (boardVisible()) timer = setTimeout(load, POLL_MS);
    };

    collecting = events;
    addEventListener('error', runtimeError);
    active = { script, runtimeError };
    script.async = true;
    script.src = `./board-events.js?qstack=${Date.now()}`;
    // Runtime syntax errors are reported to window around the script's load
    // event. Finish on the next task so the error handler can mark the stream.
    script.addEventListener('load', () => setTimeout(finish, 0), { once: true });
    script.addEventListener('error', () => {
      failed = true;
      finish();
    }, { once: true });
    doc.head.append(script);
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
    else {
      stopPolling();
      // The board is hidden in the plan view, and a modal belonging to a hidden
      // section is a modal over the wrong document.
      if (dialog?.open) dialog.close();
    }
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
