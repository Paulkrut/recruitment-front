export const POST: (request: Request) => Promise<Response>;
export const LIMITS: Readonly<Record<string, number>>;
export function createDraftHandlerForTests(options: {
  storageRoot: string;
  token: string;
  fileSystem?: typeof import('node:fs/promises');
}): (request: Request) => Promise<Response>;