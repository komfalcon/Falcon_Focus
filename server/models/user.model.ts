import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatar?: string;
  altitude: number;
  level: "Fledgling" | "Soaring" | "Apex";
  streak: number;
  feathers: number;
  preferences: {
    theme: string;
    notifications: Record<string, unknown>;
    studyDuration: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true },
    avatar: { type: String },
    altitude: { type: Number, default: 0 },
    level: { type: String, enum: ["Fledgling", "Soaring", "Apex"], default: "Fledgling" },
    streak: { type: Number, default: 0 },
    feathers: { type: Number, default: 0 },
    preferences: {
      theme: { type: String, default: "system" },
      notifications: { type: Schema.Types.Mixed, default: {} },
      studyDuration: { type: String, default: "25" },
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
