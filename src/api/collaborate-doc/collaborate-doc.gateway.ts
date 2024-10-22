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
import { CacheStoreService } from '../cache-store/cache-store.service';

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

  constructor(
    private readonly collaborateDocService: CollaborateDocService,
    private readonly cacheStoreService: CacheStoreService,
  ) {}

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

        // try {
        //   const base64Docs = JSON.parse(await this.cacheStoreService.getDoc(docName));

        //   const docUpdates = base64Docs?.map((d) => new Uint8Array(Buffer.from(d, 'base64')));

        //   if (docUpdates && docUpdates.length > 0) {
        //     ydoc.transact(() => {
        //       docUpdates.forEach((update) => {
        //         Y.applyUpdate(ydoc, update.buffer); // 将更新应用到当前 ydoc 文档
        //       });
        //     });
        //   }
        // } catch (error) {
        //   console.log('bindState error', error);
        // }

        ydoc.on('update', async (update: Uint8Array) => {
          // this.cacheStoreService.storeDoc(docName, update);
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
