export const httpsAgent = async () => {
  if (typeof window === 'undefined') {
    return new (await import('https')).Agent({ rejectUnauthorized: false });
  }

  return undefined;
};
