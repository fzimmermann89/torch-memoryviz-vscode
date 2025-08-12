### PyTorch MemoryViz VS Code Extension

- Offline bundling of MemoryViz with Bun
- Fetches latest upstream MemoryViz.js and patches CDN imports
- Opens a webview with drag-and-drop support for JSON traces

#### Build

```powershell
bun install
bun run build
```

#### Run
- Press F5 in VS Code to launch Extension Development Host
- Run "Open PyTorch MemoryViz"

#### Publish (Marketplace)
1. Create a publisher on VS Code Marketplace and set `publisher` in `package.json`.
2. Install `vsce` locally or rely on CI.
3. Set an environment secret `VSCE_TOKEN` with a Personal Access Token for your publisher.
4. Package locally:
   ```powershell
   bun run build
   bun run package  # produces .vsix
   ```
5. Publish:
   ```powershell
   VSCE_TOKEN=*** bun run publish
   ```

#### GitHub Actions
- CI fetches MemoryViz.js at build time (not committed to repo)
- CI builds the extension and optionally publishes when a tag is pushed