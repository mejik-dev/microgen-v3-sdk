import MicrogenClient from './MicrogenClient';
import { MicrogenClientOptions } from './lib/types';

/**
 * Creates a new Microgen Client.
 */
const createClient = (options: MicrogenClientOptions) => {
  return new MicrogenClient(options);
};

export * from './lib/types';

export { createClient, MicrogenClient };
