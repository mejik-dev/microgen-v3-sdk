import type { MicrogenClientOptions } from './lib/types';
import MicrogenClient from './MicrogenClient';

/**
 * Creates a new Microgen Client.
 */
const createClient = (options: MicrogenClientOptions) => {
  return new MicrogenClient(options);
};

export * from './lib/types';

export { createClient, MicrogenClient };
