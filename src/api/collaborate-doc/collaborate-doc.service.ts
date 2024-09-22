import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Y from 'yjs';
import { v4 as uuidv4 } from 'uuid';

import { CollaborateDoc } from './schema/collaborate-doc.schema';

@Injectable()
export class CollaborateDocService {
  constructor(
    @InjectModel(CollaborateDoc.name) private CollaborateDocModal: Model<CollaborateDoc>,
  ) {}

  async getDocList() {
    return this.CollaborateDocModal.find({}).exec();
  }

  async createDoc(docName: string) {
    const doc = new Y.Doc();

    const ytext = doc.getText('content');
    ytext.insert(0, '');

    const initialState = Y.encodeStateAsUpdate(doc);

    const newDoc = new this.CollaborateDocModal({
      docName,
      state: Buffer.from(initialState),
    });

    await newDoc.save();
  }

  async getDoc(recordId: string) {
    const persistedDoc = await this.CollaborateDocModal.findOne({ recordId });

    const doc = new Y.Doc();

    if (persistedDoc && persistedDoc.state) {
      return new Uint8Array(persistedDoc.state);
    }

    return Y.encodeStateAsUpdate(doc);
  }

  async storeUpdate(recordId: string, update: Uint8Array): Promise<void> {
    const existingDoc = await this.CollaborateDocModal.findOne({ recordId }).exec();

    if (existingDoc) {
      const ydoc = new Y.Doc();
      Y.applyUpdate(ydoc, existingDoc.state);
      Y.applyUpdate(ydoc, update);

      const newState = Buffer.from(Y.encodeStateAsUpdate(ydoc));

      console.log('storeUpdate >>>>', newState.toString('base64'));

      await this.CollaborateDocModal.updateOne(
        { _id: recordId },
        { $set: { state: newState } },
      ).exec();
    } else {
      const newDoc = new this.CollaborateDocModal({
        state: update,
      });
      await newDoc.save();
    }
  }
}
