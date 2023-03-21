export type MicrogenClientOptions = {
  /**
   * The unique Microgen Key which is supplied when you create a new project in your project dashboard.
   */
  apiKey: string;
  /**
   * The Microgen API URL.
   */
  host?: string;
  /**
   * secure protocol
   */
  isSecure?: boolean;
};
