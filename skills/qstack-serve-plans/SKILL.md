---
name: qstack-serve-plans
description: Serve the current repository's HTML plan collection from qstack/compound_engineering on a local HTTP address. Use when the user invokes `/qstack-serve-plans`, optionally with a port such as `/qstack-serve-plans 4173`, or asks to open or serve QStack plans locally.
---

# /qstack-serve-plans

Start a local HTTP server for the current repository's QStack plans and report
the URL. Do not edit the repository.

## Run

1. Resolve the repository root with `git rev-parse --show-toplevel`; fall back
   to the current directory outside Git.
2. Read an optional positive port from the invocation. Default to `8000`.
3. Require `qstack/compound_engineering/`. If it is missing, say that this
   repository has no QStack plans yet and stop.
4. If an explicitly requested port is occupied, report that and stop. If the
   default is occupied, choose the first free port from `8001` through `8010`.
5. Start the server as a long-running background process using the harness's
   process controls. Do not write PID or log files into the repository.

Prefer the project script:

```bash
bash <repo-root>/qstack/scripts/serve.sh <port>
```

If the script is missing, fall back without modifying the repository:

```bash
python3 -m http.server <port> --bind 127.0.0.1 \
  --directory <repo-root>/qstack/compound_engineering
```

Verify the server responds at `http://127.0.0.1:<port>/`. Report that root URL
and, when there is exactly one plan, its direct
`/plans/<slug>/plan.html` URL. Keep the response to one or two lines.
