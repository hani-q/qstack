# Fonts

Self-hosted so a plan renders identically offline, on a plane, or as a file
someone emailed themselves. All three families are under the **SIL Open Font
License 1.1**, which permits redistribution in a repository provided the license
travels with them — the `OFL-*.txt` files here are that copy. Don't delete them.

| File | Family | Role | License |
| --- | --- | --- | --- |
| `archivo-var.woff2` | Archivo (variable, 400–700) | Display and labels | [OFL](OFL-Archivo.txt) |
| `sourceserif4-var.woff2` | Source Serif 4 (variable) | Body | [OFL](OFL-SourceSerif4.txt) |
| `sourceserif4-italic-var.woff2` | Source Serif 4 Italic (variable) | Body emphasis | [OFL](OFL-SourceSerif4.txt) |
| `plexmono-400.woff2` | IBM Plex Mono 400 | Metadata, IDs, numbers | [OFL](OFL-IBMPlexMono.txt) |
| `plexmono-500.woff2` | IBM Plex Mono 500 | Metadata emphasis | [OFL](OFL-IBMPlexMono.txt) |

These are the **latin subsets** from Google Fonts (`U+0000-00FF` and friends),
around 300KB in total. A plan that needs Arabic or Urdu display type should not
extend these files — add a separate face alongside them and scope it to the
element that needs it, so every other plan keeps loading 300KB.

To refresh a face, pull the latin `@font-face` block Google Fonts serves for the
family and download the `woff2` it points at:

```bash
curl -s "https://fonts.googleapis.com/css2?family=Archivo:wght@400..700&display=swap" \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
```

The block whose `unicode-range` starts `U+0000-00FF` is the latin one.
