import { Types } from 'mongoose';

export class FriendRequestEvent {
  public readonly senderId: Types.ObjectId;
  public readonly receiverId: Types.ObjectId;
  public readonly description?: string;

  constructor(data: {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    description?: string;
  }) {
    this.senderId = data.senderId;
    this.receiverId = data.receiverId;
    this.description = data.description;
  }
}
