import jwt from "jsonwebtoken";
import { UsersModel } from "../../models/user/user.model.js";
import { comparePassword, jwtRefreshSign, jwtSign } from "../../utils/utils.js";

export default {
  async login(req, res) {
    try {
      let { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Bad request", status: 400 });
      }

      let data = await UsersModel.findOne({ email: email });
      if (data) {
        let check_password = await comparePassword(password, data.password);
        if (check_password) {
          await UsersModel.updateOne(
            { _id: data._id },
            { lastLogin: Date.now() }
          );

          const refreshToken = await jwtRefreshSign(
            data._id,
            data.tokenVersion
          );

          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: "/",
          });

          return res.status(200).json({
            username: data.username,
            email: data.email,
            name: data.name,
            lastName: data.lastName,
            role: data.role,
            status: 200,
            accessToken: await jwtSign(data._id, data.tokenVersion),
          });
        }
        if (!check_password) {
          return res.status(401).json({
            message: "wrong email or password",
            status: 401,
          });
        }
      }
      if (!data) {
        return res.status(401).json({
          message: "No such user exists",
          status: 401,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  async refreshToken(req, res) {
    try {
      let { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({
          message: "Unauthorized",
          status: 401,
        });
      }

      let payload = jwt.verify(refreshToken, process.env.VERIFY_KEY);

      let data = await UsersModel.findOne({ _id: payload.id });

      if (!data) {
        return res.status(401).json({
          message: "Unauthorized",
          status: 401,
        });
      }

      if (data.tokenVersion !== payload.version) {
        return res.status(401).json({
          message: "Unauthorized",
          status: 401,
        });
      }

      res.status(200).json({
        accessToken: await jwtSign(data._id, data.tokenVersion),
        message: "Token refreshed",
        status: 200,
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          message: "Unauthorized",
          status: 401,
        });
      }
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },

  async logout(req, res) {
    try {
      res.clearCookie("refreshToken");
      res.status(200).json({
        message: "Logout successfully",
        status: 200,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },

  async checkAuth(req, res) {
    try {
      res
        .status(200)
        .json({ message: "You have access to this site!", status: 200 });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
    }
  },

  // async authRegister(req,res) {
  //   try {
  //     let { username, name, email, lastName, role } = req.body;

  //     let createdData = await UsersModel.create({
  //       username,
  //       name,
  //       email,
  //       lastName,
  //       role,
  //       password: "$2a$12$6NkKnzbfWqWG5O42LiCk5OwBI4Bw/Lq3YnkeJYKC1H9Z9rpqfUkpi",
  //     });

  //     res.status(201).json(createdData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },
};
