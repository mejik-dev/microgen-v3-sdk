export default function getRuntime() {
  if (typeof window === 'undefined') {
    if ('Bun' in globalThis) {
      return 'bun';
    }

    if ('Deno' in globalThis) {
      return 'deno';
    }

    if (globalThis.process?.versions?.node) {
      return 'node';
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      return 'edge';
    }
  }

  return 'web';
}
