export const httpsAgent = async () => {
  if (typeof window !== 'undefined') {
    return;
  }

  return new (await import('https')).Agent({ rejectUnauthorized: false });
};
