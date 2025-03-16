import { Router } from "express";
import resultController from "../controller/result/result.controller.js";
import { checkAdminToken } from "../token/token.js";

export const result_routes = Router();

result_routes
  .post("/create", resultController.create)
  .get("/all", checkAdminToken, resultController.results)
  .get("/search", checkAdminToken, resultController.searchResult)
  .delete("/delete/:id", checkAdminToken, resultController.deleteResult);
