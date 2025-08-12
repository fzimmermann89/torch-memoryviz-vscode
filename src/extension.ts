import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext): void {
    const openCmd = vscode.commands.registerCommand("memoryviz.open", () => {
        const panel = vscode.window.createWebviewPanel(
            "memoryviz",
            "PyTorch MemoryViz",
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, "dist")),
                ],
            }
        );

        const scriptUri = panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(context.extensionPath, "dist", "webview.js"))
        );

        const csp = [
            `default-src 'none';`,
            `img-src ${panel.webview.cspSource} data:;`,
            `style-src ${panel.webview.cspSource} 'unsafe-inline';`,
            `script-src ${panel.webview.cspSource};`,
            `connect-src ${panel.webview.cspSource};`,
            `font-src ${panel.webview.cspSource};`,
        ].join(" ");

        panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="${csp}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PyTorch MemoryViz</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background);
      --fg: var(--vscode-foreground);
      --button-bg: var(--vscode-button-background);
      --button-fg: var(--vscode-button-foreground);
      --button-hover: var(--vscode-button-hoverBackground);
      --panel: var(--vscode-editorWidget-background);
      --border: var(--vscode-editorWidget-border);
    }
    html, body { height: 100%; margin: 0; background: var(--bg); color: var(--fg); }
    /* Hide the default MemoryViz file input; we provide styled controls */
    body > input[type="file"] { display: none !important; }

    #mvz-start {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      pointer-events: none; /* allow MemoryViz canvas interactions below */
    }
    .mvz-card {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--panel);
      border: 1px solid var(--border);
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-size: 13px;
    }
    .mvz-button {
      background: var(--button-bg);
      color: var(--button-fg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 10px;
      font: inherit;
      cursor: pointer;
    }
    .mvz-button:hover { background: var(--button-hover); }
    .mvz-hint { opacity: 0.85; margin-right: 6px; }
  </style>
</head>
<body>
  <div id="mvz-start"></div>
  <div id="app"></div>
  <script src="${scriptUri}"></script>
</body>
</html>`;

        panel.webview.onDidReceiveMessage(async (msg) => {
            if (msg?.type === "chooseRemoteFiles") {
                try {
                    const uris = await vscode.window.showOpenDialog({
                        canSelectFiles: true,
                        canSelectMany: true,
                        openLabel: "Open traces",
                        defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri,
                        filters: {
                            "PyTorch traces": ["pickle", "pkl", "json"],
                            "All files": ["*"]
                        },
                    });
                    if (!uris || uris.length === 0) return;

                    const files: { name: string; base64: string }[] = [];
                    for (const uri of uris) {
                        const data = await vscode.workspace.fs.readFile(uri);
                        const b64 = Buffer.from(data).toString("base64");
                        files.push({ name: vscode.workspace.asRelativePath(uri, false), base64: b64 });
                    }
                    panel.webview.postMessage({ type: "filesFromExtension", files });
                } catch (err) {
                    console.error("Failed to open remote files", err);
                    vscode.window.showErrorMessage(`MemoryViz: ${String(err)}`);
                }
            }
        });
    });

    context.subscriptions.push(openCmd);
}

export function deactivate(): void { }