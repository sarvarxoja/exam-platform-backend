import { Router } from "express";
import questionsController from "../controller/question/questions.controller.js";
import { checkAdminToken } from "../token/token.js";

export const test_routes = Router();

test_routes
  .get("/all", questionsController.findQuestions)
  .post("/create", checkAdminToken, questionsController.create)
  .patch("/update/:id", checkAdminToken, questionsController.updateQuestion)
  .delete("/delete/:id", checkAdminToken, questionsController.deleteQuestion)
  .delete("/delete/option/:id", checkAdminToken, questionsController.deleteOption);
