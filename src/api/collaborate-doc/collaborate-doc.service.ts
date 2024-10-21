import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import * as Y from 'yjs';
import { MongodbPersistence } from 'y-mongodb-provider';

import { CollaborateDoc } from './schema/collaborate-doc.schema';

@Injectable()
export class CollaborateDocService implements OnModuleInit {
  public mdb: MongodbPersistence;

  constructor(
    @InjectModel(CollaborateDoc.name) private CollaborateDocModal: Model<CollaborateDoc>,
  ) {}

  async onModuleInit() {
    this.mdb = new MongodbPersistence(
      'mongodb://admin:online@localhost:27017/online?authSource=admin',
      {
        collectionName: 'transactions',
        multipleCollections: false,
      },
    );
  }

  async getDocList() {
    return this.CollaborateDocModal.find({}).exec();
  }

  async createDoc(docName: string) {
    const doc = new Y.Doc();

    const ytext = doc.getText('monaco');
    ytext.insert(0, 'console.log("hello world")');

    const initialState = Y.encodeStateAsUpdate(doc);

    const newDoc = new this.CollaborateDocModal({
      docName,
      state: Buffer.from(initialState),
    });

    await newDoc.save();
  }

  async getDoc(recordId: string) {
    const doc = await this.CollaborateDocModal.findOne({ _id: recordId });

    return doc;
  }

  async storeUpdate(recordId: string, update: Uint8Array): Promise<void> {
    try {
      const existingDoc = await this.CollaborateDocModal.findOne({ _id: recordId }).exec();

      if (existingDoc) {
        const ydoc = new Y.Doc();

        const existingState = new Uint8Array(existingDoc.state);
        Y.applyUpdate(ydoc, existingState);
        Y.applyUpdate(ydoc, update);

        const newState = Buffer.from(Y.encodeStateAsUpdate(ydoc));

        console.log('update ydoc text ', ydoc.getText('monaco').toString());

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
    } catch (error) {
      console.log('storeUpdate error', error);
    }
  }
}
