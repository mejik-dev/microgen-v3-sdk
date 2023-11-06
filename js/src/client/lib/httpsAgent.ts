export default async function httpsAgent() {
  if (typeof window === 'undefined') {
    return new (await import('https')).Agent({ rejectUnauthorized: false });
  }

  return undefined;
}
