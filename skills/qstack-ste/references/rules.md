# ASD-STE100 rules by tier

ASD-STE100 is the Simplified Technical English specification maintained by the
AeroSpace and Defence Industries Association of Europe for maintenance
documentation. It has two parts: writing rules (sections on words, noun
clusters, verbs, sentences, procedures, descriptions, warnings, punctuation,
and practice) and a dictionary of approved words. The tiers below select
subsets. The light tier is the set that matched real confusion in transcript
evidence on 2026-10-02; the others add rules in the order a reader feels them.

## Light (1 to 60)

Applies the seven core rules in SKILL.md. Their STE sources:

| Core rule | STE section | STE wording, paraphrased |
| --- | --- | --- |
| 1. Answer first | Descriptive writing | Present the most important information first |
| 2. Active voice, actor named | Verbs | Use the active voice. In descriptions, the passive is allowed only when the agent is unknown or unimportant |
| 3. One name per thing | Words, Writing practices | Use a technical name consistently. Do not use a different word for the same thing |
| 4. Noun clusters of three or fewer | Noun clusters | Do not make noun clusters of more than three nouns. Clarify long clusters with a preposition or a relative clause |
| 5. Commands, condition first | Procedures | Write an instruction as a command. Put the condition before the command |
| 6. One topic per paragraph, six sentences | Descriptive writing | One topic per paragraph. Maximum six sentences per paragraph |
| 7. Stable list numbers | Writing practices | Use consistent references |

Not from STE, included because the evidence required it: end a run of progress
updates with the whole state (done, running, needed from the reader, time left).

## Standard (61 to 90)

Light plus:

| Rule | STE section |
| --- | --- |
| Maximum 20 words per sentence in a procedure, 25 in a description | Sentences |
| One instruction per sentence. Two actions in one sentence only when they happen at the same time | Procedures |
| Present tense for descriptions. Past tense only for what already happened, future only for what will | Verbs |
| No `-ing` verb forms (gerunds, present participles) except as part of a technical name | Verbs |
| No vague subjects: "it", "this", "that", "which" stand for a named thing in the same or the previous sentence | Writing practices |
| Articles ("the", "a") and demonstratives ("this", "these") are kept, not dropped for brevity | Sentences |
| Negative written as "not", never a double negative | Sentences |
| A paragraph starts with its topic sentence | Descriptive writing |

## Full (91 to 100)

Standard plus the word rules:

| Rule | STE section |
| --- | --- |
| Use only approved words from the STE dictionary, plus technical names and technical verbs that the product or the codebase uses | Words |
| Use an approved word only in its approved meaning. "Follow" means "come after", not "obey"; "test" is a noun, not a verb | Words |
| One approved word for one meaning. No synonyms, no stylistic variation | Words |
| Nouns as nouns, verbs as verbs. Do not use a noun as a verb or a verb as a noun | Words |
| Spell out a word rather than use a contraction or an unapproved abbreviation | Words |
| Technical names and technical verbs are defined on first use when the reader may not know them | Words |

At full tier the output will read as very plain. That is the intent of the
specification. Offer it when the reader has asked for maximum clarity, not as
a default.

## Plain substitutes for common words

A working list of plain words to prefer at full tier. It approximates the STE
dictionary from memory; the dictionary in the ASD-STE100 specification is the
authority, and a word here is not proof of approval.

| Use | Instead of |
| --- | --- |
| make sure | ensure, verify, confirm (verify is a technical verb in testing contexts and is allowed there) |
| do | perform, carry out, execute, conduct |
| start | begin, commence, initiate, launch |
| stop | cease, terminate, halt |
| get | obtain, acquire, retrieve |
| use | utilize, employ, leverage |
| show | display, indicate, demonstrate |
| tell | inform, notify, advise |
| help | assist, aid, facilitate |
| need | require |
| about | approximately, regarding, concerning |
| because | since, as, due to |
| but | however, nevertheless |
| also | in addition, additionally, furthermore |
| then | subsequently, thereafter |
| if | in the event that, should |
| before, after | prior to, following, subsequent to |
| enough | sufficient, adequate |
| more | additional, further |
| correct | accurate, proper, appropriate |
| different | various, distinct |
| important | critical, crucial, significant, key |
| possible | feasible, viable |
| problem | issue, defect (defect is a technical name in review contexts and is allowed there) |
| change | modify, alter, adjust, amend |
| check | inspect, examine, review (review is a technical name in this toolset and is allowed) |
