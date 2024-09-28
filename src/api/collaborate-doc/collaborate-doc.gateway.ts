import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import * as Y from 'yjs';
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';
import { IncomingMessage } from 'http';
import { MongodbPersistence } from 'y-mongodb-provider';

import { CollaborateDocService } from './collaborate-doc.service';

@WebSocketGateway({
  path: '/collaborateDoc',
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class CollaborateDocGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private docsMap: Map<string, Y.Doc> = new Map();

  constructor(private readonly collaborateDocService: CollaborateDocService) {}

  async handleConnection(client: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url, `http://${request.headers.host}`);

    const record_id = url.searchParams.get('record_id');

    if (!record_id) {
      client.close();

      return;
    }

    setupWSConnection(client, request, {
      docName: record_id,
      gc: true,
    });

    setPersistence({
      bindState: async (docName: string, ydoc) => {
        const persistedYdoc = await this.collaborateDocService.mdb.getYDoc(docName);
        const newUpdates = Y.encodeStateAsUpdate(ydoc);
        this.collaborateDocService.mdb.storeUpdate(docName, newUpdates);
        Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));

        ydoc.on('update', async (update: Uint8Array) => {
          this.collaborateDocService.mdb.storeUpdate(docName, update);
        });
      },
      writeState: () => {
        return new Promise((resolve) => {
          resolve(true);
        });
      },
    });
  }

  handleDisconnect(client: WebSocket) {
    // console.log('disconnected', client);
  }
}
