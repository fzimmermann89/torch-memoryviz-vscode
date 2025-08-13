# Contributing

Thanks for your interest in improving PyTorch MemoryViz for VS Code!
The extension is fully vibe coded using gpt5 in cursor.

## Project structure
```
memoryviz-vscode/
├── dist/                   # Built output (bundled extension + webview)
├── src/                    # Extension source (TypeScript)
│   ├── extension.ts        # VS Code entry
│   └── webview/            # Webview entry (imports vendor/MemoryViz)
├── vendor/                 # Generated MemoryViz.js (fetched at build time)
├── scripts/
│   └── fetch-memoryviz.ts  # Fetches & patches upstream MemoryViz.js
├── .github/workflows/ci.yml# Build/test/package/publish
└── package.json
```

## Prerequisites
- Bun (latest): `curl -fsSL https://bun.sh/install | bash`
- VS Code 1.80+

## Install & build
```powershell
bun install
bun run build
```
- The prebuild step downloads PyTorch `MemoryViz.js` from GitHub (main or `TORCH_TAG`) and patches CDN imports.
- Webview and extension are bundled into `dist/`.

## Run in VS Code
- Open the folder in VS Code
- F5 to launch an “Extension Development Host”
- Run “Open PyTorch MemoryViz” from the Command Palette

## Open files (dev host)
- Use Explorer context menu “Open with PyTorch MemoryViz”
- Or in the MemoryViz tab, click “Choose files (remote)” or “Choose files (local)”

## CI & Releases
- GitHub Actions builds on pushes/PRs.
- Tag a version to build, package, publish to Marketplace (if `VSCE_TOKEN` secret is set), and create a GitHub Release with the `.vsix`:
  ```powershell
  git tag v0.0.1
  git push origin v0.0.1
  ```

### Marketplace publishing
- Set `publisher` in `package.json`.
- Add repo secret `VSCE_TOKEN` to publish on tag.

## Notes
- `vendor/MemoryViz.js` is generated; do not commit.
- To pin to a specific PyTorch version, set `TORCH_TAG` env before build.
- PRs welcome for UI refinements, bug fixes, and feature requests.