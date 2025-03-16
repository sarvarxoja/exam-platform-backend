import mongoose, { Schema } from "mongoose";

const ResultSchema = new Schema({
  user: {
    lastName: { type: String, required: true },
    name: { type: String, required: true },
    middleNames: { type: String },
    phoneNumber: { type: String, required: true },
    birthDate: { type: Date, required: true },
    state: { type: String, required: true },
    districtCity: { type: String, required: true },
    courseNumber: { type: Number, required: true },
    universityName: { type: String, required: true },
  },
  answers: [{ questionId:{type: Schema.Types.ObjectId, ref: "Questions"}, selectedOption: String }],
  correctCount: Number,
  wrongCount: Number,
  correctPercentage: Number,
  date: { type: Date, default: Date.now },
});

export const ResultModel = mongoose.model("Results", ResultSchema);
