import mongoose, { Schema } from "mongoose";

const QuestionSchema = new Schema({
  question: String,
  options: [String],
  correctAnswer: String,
  date: { type: Date, default: Date.now },
  systemId: Number,
});

export const QuestionModel = mongoose.model("Questions", QuestionSchema);
