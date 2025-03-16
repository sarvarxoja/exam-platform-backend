import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
  },

  lastLogin: { type: Date, default: Date.now()},

  password: {
    type: String,
    required: true,
  },

  tokenVersion: {
    type: Number,
    default: 0
  }
});

export const UsersModel = mongoose.model("Admins", UserSchema);