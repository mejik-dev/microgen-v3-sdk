export default async function httpsAgent() {
  if (typeof window === 'undefined') {
    if (process.env.NEXT_RUNTIME === 'edge') {
      return undefined;
    }

    return new (await import('undici')).Agent({
      connect: { rejectUnauthorized: false },
    });
  }

  return undefined;
}
