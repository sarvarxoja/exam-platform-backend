import "dotenv/config";
import "./config/index.js";

import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import { test_routes } from "./routes/test.routes.js";
import { auth_routes } from "./routes/auth.routes.js";
import { result_routes } from "./routes/result.routes.js";
import { statistics_routes } from "./routes/startistics.routes.js";
import { sendMessage } from "./controller/support/support.controller.js";
import { checkAdminToken } from "./token/token.js";

async function starter() {
  try {
    const app = express();
    const PORT = process.env.PORT;

    app.use(
      cors({
        origin: ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
      })
    );

    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/auth", auth_routes);
    app.use("/tests", test_routes);
    app.use("/results", result_routes);
    app.post("/support", checkAdminToken, sendMessage);
    app.use("/dashboard", checkAdminToken, statistics_routes);

    app.listen(PORT, console.log(`Server is running on ${PORT} port.`));
  } catch (error) {
    console.log(error);
  }
}

starter();
