declare module 'y-websocket/bin/utils' {
  import { WebSocket } from 'ws';
  import { IncomingMessage } from 'http';
  export function setupWSConnection(
    ws: WebSocket,
    request: IncomingMessage,
    options?: { docName?: string; gc?: boolean },
  ): void;
  export function setPersistence({
    bindState,
    writeState,
  }: {
    bindState: (docName: string, ydoc: Y.Doc) => Promise<void>;
    writeState: (docName: string, ydoc: Y.Doc) => Promise<any>;
  });
}
