import type { Server } from 'node:http';

/** Serves the files of a directory on 127.0.0.1 with CORS headers. */
export function serve(directory: string, port: number): Promise<Server>;
