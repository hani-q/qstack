---
name: qstack-serve-plans
description: Serve the current repository's HTML plan collection from qstack/compound_engineering on a user-selected IP address and port. Use when the user invokes `/qstack-serve-plans`, optionally with an address and port such as `/qstack-serve-plans 127.0.0.1 4173`, or asks to open or serve QStack plans.
---

# /qstack-serve-plans

Start an HTTP server for the current repository's QStack plans and report the
URL. Do not edit the repository.

## Run

1. Resolve the repository root with `git rev-parse --show-toplevel`; fall back
   to the current directory outside Git.
2. Collect the bind IP address and port before starting anything. Treat values
   explicitly supplied by the user as answers and ask for every missing value,
   preferably in one prompt. Offer `127.0.0.1` as the recommended local-only
   address, explain that `0.0.0.0` exposes the server on all interfaces, and
   offer `8000` as the recommended port. Never infer network exposure or
   silently choose a port.
3. Require a non-empty address and a numeric port from `1` through `65535`.
4. Require `qstack/compound_engineering/`. If it is missing, say that this
   repository has no QStack plans yet and stop.
5. If the selected address and port cannot be bound, report that and ask the
   user for another address or port. Do not select a replacement silently.
6. Start the server as a long-running background process using the harness's
   process controls. Do not write PID or log files into the repository.

Prefer the project script when it accepts both arguments:

```bash
bash <repo-root>/qstack/scripts/serve.sh <port> <bind-address>
```

If the script is missing or only supports the legacy port argument, fall back
without modifying the repository:

```bash
python3 -m http.server <port> --bind <bind-address> \
  --directory <repo-root>/qstack/compound_engineering
```

Verify the server responds at `http://<bind-address>:<port>/`. When binding to
`0.0.0.0`, verify through `127.0.0.1` and report that it is listening on all
interfaces. Report the root URL and, when there is exactly one plan, its direct
`/plans/<slug>/plan.html` URL. Keep the final response to one or two lines.
