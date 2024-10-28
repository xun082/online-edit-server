import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema()
export class CodeQuestion extends Document {
  @Prop({ required: true })
  docName: string;

  @Prop({ required: true })
  desc: string;
}

export type CodeQuestionDocument = HydratedDocument<CodeQuestion>;

export const CodeQuestionSchema = SchemaFactory.createForClass(CodeQuestion);
