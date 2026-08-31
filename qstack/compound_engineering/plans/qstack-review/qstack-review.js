/* =========================================================================
   qstack-review: the score calculator.

   Models the score table in §7 exactly, first matching row wins:
     more than one P0 -> 1
     any P0           -> 2
     three or more P1 -> 3
     one or two P1    -> 4
     otherwise        -> 5

   The static table in the HTML is the no-JS fallback and stays correct
   whether or not this file runs.
   ========================================================================= */

(() => {
  const host = document.querySelector('[data-score-calc]');
  if (!host) return;

  const inputs = {
    p0: host.querySelector('[data-sc="p0"]'),
    p1: host.querySelector('[data-sc="p1"]'),
    p2: host.querySelector('[data-sc="p2"]'),
  };
  if (!inputs.p0 || !inputs.p1 || !inputs.p2) return;

  const outs = {
    p0: host.querySelector('[data-sc-out="p0"]'),
    p1: host.querySelector('[data-sc-out="p1"]'),
    p2: host.querySelector('[data-sc-out="p2"]'),
  };
  const scoreEl = host.querySelector('[data-sc-score]');
  const becauseEl = host.querySelector('[data-sc-because]');
  const readoutEl = host.querySelector('[data-sc-readout]');
  // Every element below ships in plan.html beside this file, so the one guard
  // above is the whole "is this the calculator page" check.

  // The one rule. Returns the score and the row that decided it.
  function score(p0, p1) {
    if (p0 > 1) return [1, 'more than one P0'];
    if (p0 === 1) return [2, 'any P0'];
    if (p1 >= 3) return [3, 'three or more P1'];
    if (p1 >= 1) return [4, 'one or two P1'];
    return [5, 'no P0 and no P1'];
  }

  const STATUS = { 1: 'gate', 2: 'gate', 3: 'open', 4: 'open', 5: 'locked' };

  function render() {
    const p0 = Number(inputs.p0.value);
    const p1 = Number(inputs.p1.value);
    const p2 = Number(inputs.p2.value);

    outs.p0.value = inputs.p0.value;
    outs.p1.value = inputs.p1.value;
    outs.p2.value = inputs.p2.value;

    const [n, row] = score(p0, p1);

    scoreEl.textContent = n + '/5';
    readoutEl.setAttribute('data-status', STATUS[n]);
    becauseEl.innerHTML = 'Row: <b>' + row + '</b>. ' + (n === 5
      ? 'P2 findings never move the number, so ' + p2 + ' of them still reads 5/5.'
      : 'The P2 count is carried in the report and is not part of the arithmetic.');
  }

  for (const el of Object.values(inputs)) {
    el.addEventListener('input', render);
  }
  render();
})();
