import moment from "moment-timezone";
import { getUniqueFourDigitNumber } from "../../utils/utils.js";
import { QuestionModel } from "../../models/question/question.model.js";

export default {
  async create(req, res) {
    try {
      let { question, options, correctAnswer } = req.body;

      if (!question || !options || !Array.isArray(options)) {
        return res.status(400).json({ messae: "Bad request", status: 400 });
      }

      let createdData = await QuestionModel.create({
        question,
        options,
        correctAnswer,
        date: moment().tz("Asia/Tashkent").toDate(),
        systemId: getUniqueFourDigitNumber(),
      });

      res.status(201).json({ createdData, status: 201 });
    } catch (error) {
      console.log(error);
    }
  },

  async findQuestions(req, res) {
    try {
      // Barcha savollarni olish
      let questions = await QuestionModel.find().select("-correctAnswer");

      // Savollarni tasodifiy aralashtirish
      questions = questions.sort(() => Math.random() - 0.5);

      // Har bir savolning variantlarini aralashtirish
      questions = questions.map((question) => ({
        ...question.toObject(),
        options: question.options.sort(() => Math.random() - 0.5),
      }));

      res.json({
        totalQuestions: questions.length, // Umumiy savollar soni
        questions, // Barcha savollarni yuborish
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server xatosi" });
    }
  },

  async updateQuestion(req, res) {
    try {
      const { id } = req.params; // So‘rovdan ID ni olish
      const updateFields = req.body; // Yangilash kerak bo‘lgan maydonlar

      // Bazadan savolni topish
      const question = await QuestionModel.findById(id);
      if (!question) {
        return res
          .status(404)
          .json({ message: "Question not found", status: 404 });
      }

      // Faqat bor bo‘lgan maydonlarni yangilash
      Object.keys(updateFields).forEach((key) => {
        if (question[key] !== undefined) {
          question[key] = updateFields[key];
        }
      });

      await question.save();
      res.json({ message: "Updated question ", updatedQuestion: question });
    } catch (error) {
      console.log(error.message);
    }
  },

  async deleteQuestion(req, res) {
    try {
      let { id } = req.params;

      let deletedData = await QuestionModel.findOneAndDelete({ _id: id });

      if (!deletedData) {
        return res
          .status(404)
          .json({ message: "Question not found", status: 404 });
      }

      res.status(200).json({ deletedData, status: 200 });
    } catch (error) {
      console.log(error);
    }
  },
};
