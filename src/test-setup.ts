import { readFileSync } from 'node:fs';
import { runInThisContext } from 'node:vm';

const wasm = readFileSync('src/assets/css/zlib-1.2.11.wasm');
globalThis.fetch = (async () => ({
  arrayBuffer: async () => wasm,
}) as unknown as Response) as typeof fetch;

function loadBrowserScript(path: string, transform?: (source: string) => string): void {
  const source = transform ? transform(readFileSync(path, 'utf8')) : readFileSync(path, 'utf8');
  runInThisContext(source, { filename: path });
}

loadBrowserScript('ext/zlib-1.2.11.js');
loadBrowserScript('ext/rawinflate-0.3.js');
loadBrowserScript('ext/base-x-3.0.7.js');
loadBrowserScript('ext/privatebin-1.3.4.js', source => source.replace('let PrivateBin =', 'globalThis.PrivateBin ='));
