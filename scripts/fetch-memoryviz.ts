import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";

const TAG = process.env.TORCH_TAG || "main";
const RAW_URL = `https://raw.githubusercontent.com/pytorch/pytorch/${TAG}/torch/utils/viz/MemoryViz.js`;

async function fetchAndPatch(): Promise<void> {
    console.log(`Fetching MemoryViz.js from ${RAW_URL}...`);
    const res = await fetch(RAW_URL);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    let code = await res.text();

    console.log("Patching CDN imports to local packages...");
    code = code
        .replace(
            /import \* as d3 from "https:\/\/cdn\.skypack\.dev\/d3@5";/,
            `import * as d3 from "d3";`
        )
        .replace(
            /import {axisLeft} from "https:\/\/cdn\.skypack\.dev\/d3-axis@1";/,
            `import { axisLeft } from "d3-axis";`
        )
        .replace(
            /import {scaleLinear} from "https:\/\/cdn\.skypack\.dev\/d3-scale@1";/,
            `import { scaleLinear } from "d3-scale";`
        )
        .replace(
            /import {zoom, zoomIdentity} from "https:\/\/cdn\.skypack\.dev\/d3-zoom@1";/,
            `import { zoom, zoomIdentity } from "d3-zoom";`
        )
        .replace(
            /import {brushX} from "https:\/\/cdn\.skypack\.dev\/d3-brush@1";/,
            `import { brushX } from "d3-brush";`
        );

    const outPath = join(import.meta.dir, "../vendor/MemoryViz.js");
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, code);
    console.log(`Patched MemoryViz.js saved to ${outPath}`);
}

await fetchAndPatch();