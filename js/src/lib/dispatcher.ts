import getRuntime from './util';

export default async function getDispatcher() {
  return getRuntime() === 'node'
    ? (await import('../lib/httpsAgent')).default()
    : undefined;
}
