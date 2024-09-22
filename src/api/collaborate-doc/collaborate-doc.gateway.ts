import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { IncomingMessage } from 'http';

import { CollaborateDocService } from './collaborate-doc.service';

@WebSocketGateway({
  path: '/CollaborateDoc',
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class CollaborateDocGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private doc: Y.Doc;
  private wsProvider: WebsocketProvider;
  private docsMap: Map<string, Y.Doc> = new Map();

  constructor(private readonly CollaborateDocService: CollaborateDocService) {
    this.doc = new Y.Doc();
  }

  async handleConnection(client: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url, `http://${request.headers.host}`);

    const record_id = url.searchParams.get('record_id');

    if (!record_id) {
      client.close();

      return;
    }

    let ydoc = this.docsMap.get(record_id);

    if (!ydoc) {
      ydoc = new Y.Doc();
      this.docsMap.set(record_id, ydoc);

      const persistedState = await this.CollaborateDocService.getDoc(record_id);

      console.log('persistedState >>>>>', Buffer.from(persistedState).toString('base64'));

      if (persistedState) {
        Y.applyUpdate(ydoc, persistedState);
      }
    }

    // 自定义消息处理
    client.on('message', (message: ArrayBuffer) => {
      // const encoder = encoding.createEncoder();
      // const decoder = decoding.createDecoder(new Uint8Array(message));
      // const messageType = decoding.readVarUint(decoder);
      // console.log('Raw message:', messageType);
      // switch (messageType) {
      //   case syncProtocol.messageYjsUpdate:
      //     decoding.readVarUint(decoder); // Read the additional length
      //     const update = decoding.readVarUint8Array(decoder);
      //     Y.applyUpdate(ydoc, update);
      //     break;
      // }
    });

    setupWSConnection(client, request, {
      docName: record_id,
      gc: true,
    });
  }

  handleDisconnect(client: WebSocket) {
    // console.log('disconnected', client);
  }
}
