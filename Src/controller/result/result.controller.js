import mongoose, { MongooseError } from "mongoose";
import moment from "moment-timezone";
import { ResultModel } from "../../models/result/result.model.js";
import { QuestionModel } from "../../models/question/question.model.js";

export default {
  async create(req, res) {
    try {
      const { user, answers } = req.body;

      if (!user || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      // **Umumiy test savollari sonini olish**
      const totalQuestions = await QuestionModel.countDocuments();

      // Barcha savollarni bazadan olish
      const questionIds = answers.map((a) => a.questionId);
      const questions = await QuestionModel.find({ _id: { $in: questionIds } });

      let correctCount = 0;
      let wrongCount = 0;

      answers.forEach((answer) => {
        const question = questions.find(
          (q) => q._id.toString() === answer.questionId
        );
        if (question) {
          if (question.correctAnswer === answer.selectedOption) {
            correctCount++;
          } else {
            wrongCount++;
          }
        }
      });

      // **Javob berilmagan savollarni aniqlash va noto‘g‘ri hisoblash**
      const answeredQuestionIds = answers.map((a) => a.questionId);
      const unansweredQuestions = await QuestionModel.find({
        _id: { $nin: answeredQuestionIds },
      });

      wrongCount += unansweredQuestions.length; // **Javob berilmagan savollar noto‘g‘ri hisoblanadi**

      // **To‘g‘ri javob bergan foizni to‘g‘ri hisoblash**
      const correctPercentage =
        totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

      // **Natijani saqlash**
      const newResult = new ResultModel({
        user,
        answers: answers.map((a) => ({
          questionId: new mongoose.Types.ObjectId(a.questionId),
          selectedOption: a.selectedOption,
        })),
        correctCount,
        wrongCount,
        correctPercentage,
        date: moment().tz("Asia/Tashkent").toDate(),
      });

      await newResult.save();

      res.status(201).json({
        message: "Result saved successfully",
        correctCount,
        wrongCount,
        correctPercentage,
        unansweredQuestions: unansweredQuestions.map((q) => ({
          questionId: q._id,
          question: q.question,
        })),
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },

  async results(req, res) {
    try {
      const page = parseInt(req.query.page) || 1; // Default 1-sahifa
      const limit = parseInt(req.query.limit) || 10; // Default 10 ta natija

      const skip = (page - 1) * limit; // Sahifani o'tkazish

      // Umumiy natijalar sonini olish
      const totalResults = await ResultModel.countDocuments().sort({
        date: -1,
      });

      // Natijalarni pagination bilan olish
      const results = await ResultModel.find()
        .populate("answers.questionId")
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        totalResults, // Umumiy natijalar soni
        totalPages: Math.ceil(totalResults / limit), // Umumiy sahifalar
        currentPage: page, // Joriy sahifa
        results, // Sahifalanib yuborilgan natijalar
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },

  async resultById(req, res) {
    try {
      const { id } = req.params;
      const result = await ResultModel.findById(id).populate(
        "answers.questionId"
      );

      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof MongooseError) {
        return res.status(400).json({ message: "Invalide id", status: 400 });
      }
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },

  async deleteResult(req, res) {
    try {
      let { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "Bad request (id must not be empty)", status: 400 });
      }

      let deletedData = await ResultModel.findOneAndDelete({ _id: id });

      if (!deletedData) {
        return res
          .status(404)
          .json({ message: "Result not found", status: 404 });
      }

      res.status(200).json({ deletedData, status: 200 });
    } catch (error) {
      if (error instanceof MongooseError) {
        return res.status(400).json({ message: "Invalide id", status: 400 });
      }
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },

  async searchResult(req, res) {
    try {
      const { name, lastName, minPercentage, maxPercentage } = req.query;

      let filter = {};

      if (name) {
        filter["user.name"] = new RegExp(name, "i"); // "i" registrni e'tiborga olmaydi
      }

      if (lastName) {
        filter["user.lastName"] = new RegExp(lastName, "i");
      }

      if (minPercentage && maxPercentage) {
        filter.correctPercentage = {
          $gte: parseFloat(minPercentage),
          $lte: parseFloat(maxPercentage),
        };
      }

      const results = await ResultModel.find(filter);
      res.json(results);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },
};
