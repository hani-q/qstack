# Diff review

The security review `/qstack-security-review` always carries, whether or not
any outside collection is installed. Adapted from the prompt and the hard
exclusion rules of Anthropic's `claude-code-security-review` action; see
`THIRD_PARTY_NOTICES.md`.

## What counts

A finding is a defect the reviewed change introduces that an attacker can reach
and that ends in unauthorized access, data exposure, code execution, or a
bypassed control. All three parts are required, plus the confidence bar at the
end of this file. Missing one, it is not a finding.

For a diff, review only what the change adds or alters. A pre-existing weakness
in a changed file is reported in the "Not checked" part of the report as
context, never as a finding, because the change did not cause it and the score
must measure the change. For a directory or repository scope, "introduced"
means present, and everything reachable is in scope.

## Categories

Check each changed file against every group. The list is a floor: a reachable
defect outside it is still a finding.

- **Input reaching an interpreter**: SQL, NoSQL, shell and subprocess
  arguments, templates, XML parsers, path components in file operations,
  `eval` and dynamic code, deserialization of untrusted bytes including pickle
  and YAML loaders, regular expressions built from input.
- **Authentication and authorization**: a check that can be skipped, an
  identity taken from the request rather than the session, a privilege
  boundary crossed without a check, session or token handling that accepts a
  forged, expired, or wrong-audience value, a missing ownership check on an
  object id.
- **Cryptography and secrets**: a key, password, or token written into the
  source, a broken or home-grown algorithm, a non-cryptographic random source
  used for a secret, certificate or signature verification turned off, keys
  logged or stored beside the data they protect.
- **Data exposure**: sensitive values written to logs, error responses, or
  debug output, an endpoint returning more fields than its caller is allowed
  to see, personal data handled against the repository's own stated policy.
- **Cross-site scripting**: input rendered into HTML, attributes, or script
  without encoding, in reflected, stored, or DOM form.

Something exploitable only from the local network is still in scope.

## Method

1. **Learn the repository's defences first.** Find the validation, encoding,
   authorization, and secrets patterns the code already uses. A finding that
   ignores an existing guard is a false positive, and a change that bypasses
   an existing guard is a stronger finding.
2. **Compare the change against those patterns.** Where the change does the
   same job differently, ask why. Inconsistency is where defects live.
3. **Trace, do not pattern-match.** For each candidate, follow the data from
   the entry point to the sink and name every step. If the trace breaks at a
   guard, drop the candidate. If it reaches the sink, write the attacker's
   steps as the exploit scenario.

## Never report

These classes are excluded whatever the evidence. The action's authors found
they are nearly always noise in a change review, and a reader who wants them
has other tools.

- Denial of service, resource exhaustion, unbounded loops or recursion, CPU or
  memory consumption.
- Missing or weak rate limiting.
- Resource leaks: unclosed files, connections, sockets, threads.
- Open or unvalidated redirects.
- Regular-expression injection or catastrophic backtracking.
- Memory-safety classes, such as buffer overflows, out-of-bounds access,
  use-after-free, and integer overflow, in any file that is not C or C++.
- Server-side request forgery reported against an HTML file.
- Anything located in a Markdown file.
- Secrets already on disk in configuration or environment files. Secrets
  newly written into source by the change are in scope.
- Missing input validation on a field with no security consequence. Without a
  traced consequence, validation advice is not a finding.

## Severity and confidence

- **P0**: directly exploitable as written, ending in code execution, a data
  breach, or an authentication bypass.
- **P1**: exploitable under conditions the exploit scenario names, with a
  significant consequence.
- **P2**: a defence-in-depth gap the trace shows is reachable, with limited
  consequence.

Report a finding only at eighty percent confidence or above: a clear path
traced, or a known exploitation method against a recognised pattern. Between
seventy and eighty, list it under "Unverified" with what would settle it, and
give it no severity. Below seventy, drop it. Better to miss a theoretical issue
than to fill the report with ones that do not hold.
