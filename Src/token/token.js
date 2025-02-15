import jwt from "jsonwebtoken";
import { UsersModel } from "../models/user/user.model.js";

export const checkAdminToken = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1]; 

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Access token not found", status: 401 });
    }

    let payload = jwt.verify(accessToken, process.env.SECRET_KEY);
    let data = await UsersModel.findOne({ _id: payload.id });

    if (!data) {
      return res.status(401).json({ message: "Unauthorized", status: 401 });
    }

    if (data.tokenVersion !== payload.version) {
      return res.status(401).json({ message: "Unauthorized", status: 401 });
    }

    req.admin = data;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Unauthorized", status: 401 });
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", status: 500 });
  }
};
