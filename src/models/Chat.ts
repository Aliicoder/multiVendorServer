import { Schema, Document, models, model } from "mongoose";
import { IParticipant, ParticipantSchema } from ".";
export interface IChat extends Document {
  participants: IParticipant[];
  recentMessage: string
}

const ChatSchema = new Schema<IChat>(
  {
    participants: {type:[ParticipantSchema],required:true},
    recentMessage: {type: String, trim:true}
  },
  {
    timestamps: true
  }
);

ChatSchema.index({ 
  'participants.userId': 1 
});
const Chat = models.Chat || model<IChat>('Chat', ChatSchema);

export default Chat;
