import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import * as Y from 'yjs';
import { MongodbPersistence } from 'y-mongodb-provider';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

import { CollaborateDoc } from './schema/collaborate-doc.schema';
import { CreateShareLinkDto, ShareDetailDto } from './dto/collaborate-doc.dto';

import { MongoDbUrlEnum } from '@/common/enum/config.enum';

@Injectable()
export class CollaborateDocService implements OnModuleInit {
  public mdb: MongodbPersistence;

  constructor(
    @InjectModel(CollaborateDoc.name) private CollaborateDocModal: Model<CollaborateDoc>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.mdb = new MongodbPersistence(this.configService.get(MongoDbUrlEnum.MONGODB_URL), {
      collectionName: 'transactions',
      multipleCollections: false,
    });
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

    const data = await newDoc.save();

    return {
      data,
    };
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

  async createShareLink(shareDocDto: CreateShareLinkDto) {
    const { recordId, accessLevel = 'edit' } = shareDocDto;

    const shareId = uuidv4();

    const shareLink = `/share/${shareId}`;

    await this.CollaborateDocModal.findByIdAndUpdate(recordId, {
      shareId,
      shareLink,
      accessLevel,
    });

    return { shareLink, accessLevel };
  }

  async shareLinkDetail(shareDetailDto: ShareDetailDto) {
    const { shareId } = shareDetailDto;
    const document = await this.CollaborateDocModal.findOne({ shareId });

    if (!document) {
      throw new NotFoundException('share link not find');
    }

    return {
      document: document.state, // 假设文档内容保存在 content 字段中
      accessLevel: document.accessLevel,
    };
  }

  // @Cron(CronExpression.EVERY_10_MINUTES)
  // handleMergeUpdate() {
  //   this.mdb.flushDocument();
  // }
}
