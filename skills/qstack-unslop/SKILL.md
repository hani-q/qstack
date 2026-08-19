---
name: qstack-unslop
description: Rewrite the previous answer to remove AI writing patterns and add a natural human voice without losing meaning or useful detail.
disable-model-invocation: true
---

# /qstack-unslop

Rewrite the immediately previous assistant answer. Output only the rewrite.

## Process

1. Scan for the patterns below.
2. Rewrite while preserving meaning, useful detail, technical accuracy, and the
   intended tone. Do not shorten merely for the sake of shortening.
3. Add human voice where it fits.
4. Ask, "What makes this obviously AI generated?" Fix the remaining tells.

Do not add facts, claims, decisions, or recommendations. Keep file paths,
commands, warnings, and next actions when the reader still needs them. Do not
repeat the work or call tools.

If there is no previous substantive assistant answer, say so in one short line.

## Human voice

- Have opinions when judgment is useful. React to facts instead of mechanically
  listing pros and cons.
- Vary rhythm. Mix short sentences with longer ones when the idea needs room.
- Acknowledge real complexity instead of flattening every reaction.
- Use "I" when it fits. First person is not unprofessional.
- Allow natural asymmetry. Perfectly repeated structure looks manufactured.
- Be specific. Replace a vague feeling with the fact that causes it.

## Patterns to fix

### Content

1. **Puffery.** Cut phrases such as "pivotal moment", "testament to", "evolving
   landscape", "setting the stage for", "indelible mark", and "deeply rooted."
   State what happened.
2. **Name-dropping.** Do not list media outlets without context. Pick the
   relevant source and say what it reported.
3. **Superficial -ing phrases.** Delete or substantiate phrases such as
   "highlighting", "ensuring", "reflecting", "showcasing", and "fostering."
4. **Promotional language.** Replace "nestled", "vibrant", "breathtaking",
   "groundbreaking", "renowned", "stunning", and "must-visit" with neutral
   descriptions.
5. **Vague attributions.** Name the source behind "experts believe", "industry
   reports suggest", or "some critics argue", or delete the claim.
6. **Formulaic challenges.** Replace "despite challenges, it continues to
   thrive" with the specific facts.

### Language

7. **AI vocabulary.** Replace additionally, crucial, delve, enduring, enhance,
   fostering, garner, interplay, intricate, abstract landscape, pivotal,
   showcase, abstract tapestry, testament, underscore, and vibrant with plain
   words.
8. **Fancy ways to say "is".** Replace "serves as", "stands as", "boasts", and
   "features" with "is" or "has" when that is the meaning.
9. **"Not just X, but Y."** State the point directly.
10. **Forced groups of three.** Use the natural number of items.
11. **Synonym cycling.** Pick one accurate term and repeat it.
12. **False ranges.** Use "from X to Y" only when X and Y form a meaningful
    scale. Otherwise list the topics directly.

### Style

13. **Em dash overuse.** Use periods or commas. Do not replace em dashes with
    parentheses, en dashes, or hyphens used as dashes.
14. **Colon overuse.** Use a colon before a real list or example, not as a
    routine mid-sentence connector.
15. **Boldface overuse.** Do not bold every proper noun or acronym.
16. **Inline-header lists.** Remove a bold label that merely restates its line.
    A short bold name followed by genuinely new detail is fine.
17. **Title case headings.** Use sentence case.
18. **Decorative emojis.** Remove them from headings and bullets.
19. **Curly quotes.** Use straight quotes.

### Communication artifacts

20. **Chatbot phrases.** Remove "I hope this helps", "Let me know if", "Of
    course", "Certainly", and manufactured excitement.
21. **Cutoff disclaimers.** Find the missing facts or remove the claim instead
    of saying details are limited.
22. **Sycophantic tone.** Respond directly instead of praising the question or
    reflexively agreeing.

### Filler

23. **Filler phrases.** Change "in order to" to "to" and "due to the fact that"
    to "because". Delete "it is important to note that."
24. **Excessive hedging.** Replace stacked qualifiers with the one uncertainty
    word the evidence supports.
25. **Generic conclusions.** State the specific result, next step, or open fact.

### Jargon

26. **Abstract metaphor nouns.** Prefer a concrete word over substrate, wedge,
    vector, locus, vantage, nexus, primitive used as a noun, harness used as a
    metaphor, surface used for API scope, bedrock, scaffolding used as a
    metaphor, modality, paradigm, gold-plating, ratchet used as a metaphor,
    evacuate used for moving code, endgame, north star, and flywheel.

### Plain speech

27. **Say what it does.** Replace a vague feeling with a mechanism, instruction,
    fact, or number. Cut a sentence that could describe any project unchanged.
28. **Split dense sentences.** Use one idea per sentence when a reader would
    otherwise need to backtrack.
29. **Active voice.** Name the actor when it matters. Passive voice is fine when
    the actor is unknown or irrelevant.
30. **Weak verbs propped up by adverbs.** Use a stronger verb or the measured
    result.
31. **Fancy synonyms.** Prefer "use" over "utilize" or "leverage", "help" over
    "facilitate", "many" over "numerous", and "if" over "in the event that."

<!-- Adapted from Lauren Tan's PStack `unslop` at commit 60c641e4fad674784b30abcf9f8915dea39df38d. See ../../THIRD_PARTY_NOTICES.md. -->
