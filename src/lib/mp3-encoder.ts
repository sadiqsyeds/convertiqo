/**
 * MP3 encoder loader using lamejs (lame.all.js).
 *
 * lame.all.js is a named function declaration `function lamejs() { ... }`
 * that — when loaded as a <script> — becomes window.lamejs.
 * Calling lamejs() sets lamejs.Mp3Encoder and lamejs.WavHeader on itself.
 * The last line of the file is `lamejs()` which triggers this automatically.
 *
 * We load it from /public via a <script> tag to bypass all bundler issues.
 */

export interface IMp3Encoder {
  encodeBuffer(left: Int16Array, right?: Int16Array): Int8Array;
  flush(): Int8Array;
}

type LamejsGlobal = {
  Mp3Encoder: new (channels: number, sampleRate: number, kbps: number) => IMp3Encoder;
};

// Cached constructor after first successful load
let _Mp3Encoder: LamejsGlobal["Mp3Encoder"] | null = null;

export async function getMp3Encoder(): Promise<
  new (channels: number, sampleRate: number, kbps: number) => IMp3Encoder
> {
  if (_Mp3Encoder) return _Mp3Encoder;

  const g = globalThis as unknown as { lamejs?: LamejsGlobal };

  // Already loaded by a previous call
  if (g.lamejs?.Mp3Encoder) {
    _Mp3Encoder = g.lamejs.Mp3Encoder;
    return _Mp3Encoder;
  }

  // Inject <script src="/lame.all.js"> — this bypasses all bundler issues
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-lamejs="1"]');
    if (existing) {
      // Script tag already added — wait for it if still loading
      if (g.lamejs?.Mp3Encoder) { resolve(); return; }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("lame.all.js failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = "/lame.all.js";
    script.setAttribute("data-lamejs", "1");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load /lame.all.js — ensure it is in the /public folder"));
    document.head.appendChild(script);
  });

  if (!g.lamejs?.Mp3Encoder) {
    throw new Error("lamejs.Mp3Encoder not found after script load");
  }

  _Mp3Encoder = g.lamejs.Mp3Encoder;
  return _Mp3Encoder;
}
