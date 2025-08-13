import { add_local_files } from "../../vendor/MemoryViz.js";

function acquireVsCodeApiSafe(): any | undefined {
    try {
        // @ts-ignore VS Code injects this in webviews
        return acquireVsCodeApi?.();
    } catch {
        return undefined;
    }
}

const vscode = acquireVsCodeApiSafe();

function toBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function selectLastSnapshot(): void {
    const sel = document.querySelector<HTMLSelectElement>("body select");
    if (sel && sel.options.length > 0) {
        sel.selectedIndex = sel.options.length - 1;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
}

async function filesToBase64Entries(fileList: FileList | File[]): Promise<{ name: string; base64: string }[]> {
    const files = Array.from(fileList as File[]);
    const entries = await Promise.all(
        files.map(async (f) => {
            const buf = await f.arrayBuffer();
            return { name: f.name, base64: toBase64(buf) };
        })
    );
    return entries;
}

function buildStartCard(): void {
    const start = document.getElementById("mvz-start");
    if (!start) return;

    const card = document.createElement("div");
    card.className = "mvz-card";

    const hint = document.createElement("span");
    hint.className = "mvz-hint";
    hint.textContent = "Load a trace:";

    const remoteBtn = document.createElement("button");
    remoteBtn.className = "mvz-button";
    remoteBtn.textContent = "Choose files (remote)";
    remoteBtn.onclick = () => vscode?.postMessage({ type: "chooseRemoteFiles" });

    const localLabel = document.createElement("label");
    localLabel.className = "mvz-button";
    localLabel.textContent = "Choose files (local)";
    const localInput = document.createElement("input");
    localInput.type = "file";
    localInput.multiple = true;
    localInput.style.display = "none";
    localLabel.appendChild(localInput);

    localInput.addEventListener("change", async function () {
        const input = this as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const entries = await filesToBase64Entries(input.files);
            add_local_files(entries, "Active Memory Timeline");
            selectLastSnapshot();
        }
        (this as HTMLInputElement).value = "";
    });

    card.appendChild(hint);
    card.appendChild(remoteBtn);
    card.appendChild(localLabel);
    start.appendChild(card);
}

document.addEventListener("DOMContentLoaded", () => {
    buildStartCard();

    const onDragOver = (ev: DragEvent) => {
        ev.preventDefault();
    };

    const onDrop = async (ev: DragEvent) => {
        ev.preventDefault();
        if (!ev.dataTransfer || ev.dataTransfer.files.length === 0) return;
        const entries = await filesToBase64Entries(ev.dataTransfer.files);
        add_local_files(entries, "Active Memory Timeline");
        selectLastSnapshot();
    };

    document.body.addEventListener("dragover", onDragOver);
    document.body.addEventListener("drop", onDrop);
});

window.addEventListener("message", (ev: MessageEvent) => {
    const msg = ev.data;
    if (msg?.type === "filesFromExtension" && Array.isArray(msg.files)) {
        add_local_files(msg.files, "Active Memory Timeline");
        selectLastSnapshot();
    }
});