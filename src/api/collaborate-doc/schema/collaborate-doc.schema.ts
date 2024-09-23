import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema()
export class CollaborateDoc extends Document {
  @Prop({ required: true })
  docName: string;

  @Prop({ type: Buffer })
  state: Buffer;

  @Prop({ default: Date.now })
  lastModified: Date;
}

export type CollaborateDocDocument = HydratedDocument<CollaborateDoc>;

export const CollaborateDocSchema = SchemaFactory.createForClass(CollaborateDoc);
