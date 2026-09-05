# Third-party notices

## Ponytail

The implementation ladder in the execution loops, the design-sheet rule in
`qstack-plan-to-html`, and the reviewer's unrequested-code check adapt the
ruleset from Dietrich Gebert's
[Ponytail](https://github.com/DietrichGebert/ponytail/tree/2ed6c52c9d7e5e56942508591085fd45dea277d3)
at commit `2ed6c52c9d7e5e56942508591085fd45dea277d3`:

| Ponytail source | QStack adaptation |
| --- | --- |
| `skills/ponytail/SKILL.md` decision ladder, rules, and "When NOT to be lazy" | The "Build what the plan prescribes" paragraph under Execute and orchestrate in `qstack-loop-no-nonsense` and `qstack-loop-trequartista` |
| `skills/ponytail/SKILL.md` decision ladder | The design sheet rule in `qstack-plan-to-html` |
| `skills/ponytail-review/SKILL.md` | The unrequested-code finding in both loops' adversarial review brief |

Ponytail is licensed under the following terms:

MIT License

Copyright (c) 2026 DietrichGebert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## PStack

The following QStack skills and shared global writing instructions adapt work
from Lauren Tan's PStack, sourced from the
[`pstack` directory in `cursor/plugins`](https://github.com/cursor/plugins/tree/60c641e4fad674784b30abcf9f8915dea39df38d/pstack)
at commit `60c641e4fad674784b30abcf9f8915dea39df38d`:

| PStack source | QStack adaptation |
| --- | --- |
| `blast-radius` | `qstack-blast-radius` |
| `principle-separate-before-serializing-shared-state` | `qstack-separate-before-serializing-shared-state` |
| `principle-encode-lessons-in-structure` | `qstack-encode-lessons-in-structure` |
| `principle-make-operations-idempotent` | `qstack-make-operations-idempotent` |
| `principle-model-the-domain` | `qstack-model-the-domain` |
| `principle-foundational-thinking` | `qstack-foundational-thinking` |
| `how` | `qstack-how` |
| `principle-build-the-lever` | `qstack-build-the-lever` |
| `principle-fix-root-causes` | `qstack-fix-root-causes` |
| `principle-prove-it-works` | `qstack-prove-it-works` |
| `unslop` | `GENERAL_INSTRUCTIONS.md` writing guidance and `qstack-unslop` |

PStack is licensed under the following terms:

MIT License

Copyright (c) 2026 Lauren Tan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## frontend-design

`skills/qstack-ui-prototype/references/frontend-design.md` is a verbatim copy of
Anthropic's [`frontend-design`](https://github.com/anthropics/skills/tree/41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f/skills/frontend-design)
skill, `skills/frontend-design/SKILL.md` at commit
`41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f`. It is vendored so that
`/qstack-ui-prototype` reads the same design brief in every harness, offline,
whether or not the plugin is installed. `skills/qstack-ui-prototype/scripts/check-upstream`
reports when the upstream file has moved.

frontend-design is licensed under the Apache License, Version 2.0. The complete
licence text ships beside the copy as
`skills/qstack-ui-prototype/references/LICENSE-frontend-design.txt`.

## ui-ux-pro-max

`skills/qstack-ui-prototype/references/ui-checklist.md` adapts the
`references/quick-reference.md` and `references/pro-rules.md` files of Next
Level Builder's
[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/f3ac195224eac1eb0dfe1a3059c2a6add78ffbe3/.claude/skills/ui-ux-pro-max/references)
at commit `f3ac195224eac1eb0dfe1a3059c2a6add78ffbe3`. The rules are condensed
and trimmed to what a static prototype can violate; the data catalogs, search
scripts, and design-system generator are not used.

| ui-ux-pro-max source | QStack adaptation |
| --- | --- |
| `references/quick-reference.md` categories 1, 2, 4 to 10 | Sections 1 to 9 of `ui-checklist.md` |
| `references/pro-rules.md` icon, contrast, layout tables and pre-delivery checklist | Section 3 and the pre-delivery pass of `ui-checklist.md` |

ui-ux-pro-max is licensed under the following terms:

MIT License

Copyright (c) 2024 Next Level Builder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
