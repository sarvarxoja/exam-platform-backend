import { MongooseError } from "mongoose";
import { QuestionModel } from "../../models/question/question.model.js";
import { ResultModel } from "../../models/result/result.model.js";

export default {
  async getStatistics(req, res) {
    try {
      // Barcha natijalarni bazadan olish
      const results = await ResultModel.find({}, "correctPercentage");
      const totalResults = results.length; // Umumiy natijalar soni

      // Kategoriyalarni hisoblash
      let lowLevel = 0; // 0-39%
      let weakLevel = 0; // 40-59%
      let strongLevel = 0; // 60-79%
      let highLevel = 0; // 80-100%

      results.forEach((result) => {
        const percentage = result.correctPercentage;
        if (percentage >= 0 && percentage <= 39) {
          lowLevel++;
        } else if (percentage >= 40 && percentage <= 59) {
          weakLevel++;
        } else if (percentage >= 60 && percentage <= 79) {
          strongLevel++;
        } else if (percentage >= 80 && percentage <= 100) {
          highLevel++;
        }
      });

      // Har bir kategoriya foizini hisoblash
      const calculatePercentage = (count) =>
        totalResults > 0 ? ((count / totalResults) * 100).toFixed(2) : 0;

      // Response qaytarish
      res.status(200).json({
        totalResults, // Umumiy natijalar soni
        pastDaraja: {
          count: lowLevel,
          percentage: calculatePercentage(lowLevel),
        },
        kuchsizDaraja: {
          count: weakLevel,
          percentage: calculatePercentage(weakLevel),
        },
        kuchliDaraja: {
          count: strongLevel,
          percentage: calculatePercentage(strongLevel),
        },
        yuqoriDaraja: {
          count: highLevel,
          percentage: calculatePercentage(highLevel),
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },

  async findQuestions(req, res) {
    try {
      // URL query parametrlaridan sahifa va limitni olish (agar parametrlar yuborilmasa, default qiymat 1 va 10)
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      // Savollarni sahifalash uchun so'rovga qo'shimcha skip va limit parametrlarini qo'shamiz
      const questions = await QuestionModel.find().skip(skip).limit(limit).sort({date: -1});

      // Jami savollar sonini olish
      const total = await QuestionModel.countDocuments();

      res.json({
        total, // Barcha savollar soni
        page, // Hozirgi sahifa raqami
        pages: Math.ceil(total / limit), // Jami sahifa soni
        questions, // Tanlangan sahifadagi savollar
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server xatosi" });
    }
  },

  async searchQuestion(req, res) {
    try {
      const { systemId } = req.query;
      if (!systemId) {
        return res
          .status(400)
          .json({ message: "systemId query parametri kiritilishi shart" });
      }

      // Kiritilgan qiymatni string shaklida qabul qilamiz
      const searchStr = systemId.toString();

      // Regex yaratamiz; 'i' flag katta-kichik harf sezgir emasligini ta'minlaydi
      const regex = new RegExp(searchStr, "i");

      // Aggregation pipeline orqali:
      // 1. systemId ni stringga aylantirib yangi systemIdStr maydoni sifatida qo‘shamiz
      // 2. keyin systemIdStr yoki question maydonlari regexga mos keladigan hujjatlarni tanlaymiz
      const results = await QuestionModel.aggregate([
        {
          $addFields: {
            systemIdStr: { $toString: "$systemId" },
          },
        },
        {
          $match: {
            $or: [
              { systemIdStr: { $regex: regex } },
              { question: { $regex: regex } },
            ],
          },
        },
      ]);

      res.json({ results });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },

  async findTestById(req, res) {
    try {
      let { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "Bad request (id must not be empty)", status: 400 });
      }

      let test = await QuestionModel.findOne({ _id: id });

      if (!test) {
        return res.status(404).json({ message: "Test not found", status: 404 });
      }

      res.status(200).json({ test, status: 200 });
    } catch (error) {
      if (error instanceof MongooseError) {
        return res.status(400).json({ message: "Invalide id", status: 400   });
      }
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },
};
