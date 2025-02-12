import { Router } from "express";
import dashboardController from "../controller/dashboard/dashboard.controller.js";
import resultController from "../controller/result/result.controller.js";

export const statistics_routes = Router();

statistics_routes
  .get("/result/:id", resultController.resultById)
  .get("/tests", dashboardController.findQuestions)
  .get("/results", dashboardController.getStatistics)
  .get("/test/:id", dashboardController.findTestById)
  .get("/tests/search", dashboardController.searchQuestion);
