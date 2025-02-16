import "dotenv/config";
import "./config/index.js";

import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import { checkAdminToken } from "./token/token.js";

import { test_routes } from "./routes/test.routes.js";
import { auth_routes } from "./routes/auth.routes.js";
import { result_routes } from "./routes/result.routes.js";
import { statistics_routes } from "./routes/startistics.routes.js";
import { ProfileMe } from "./controller/profile/profile.controller.js";
import { sendMessage } from "./controller/support/support.controller.js";

async function starter() {
  try {
    const app = express();
    const PORT = process.env.PORT;

    app.use(
      cors({
        origin: ["https://admin.alsafia.uz", "https://alsafia.uz"],
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
    app.get("/profile/me", checkAdminToken, ProfileMe);
    app.use("/dashboard", checkAdminToken, statistics_routes);

    app.listen(PORT, console.log(`Server is running on ${PORT} port.`));
  } catch (error) {
    console.log(error);
  }
}

starter();
