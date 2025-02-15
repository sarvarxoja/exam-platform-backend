import { UsersModel } from "../../models/user/user.model.js";

export const ProfileMe = async (req, res) => {
  try {
    let myData = await UsersModel.findOne({ _id: req.admin._id }).select(
      "-password"
    );
    res.status(200).json({ myData, status: 200 });
  } catch (error) {
    res.status(500).json({
        message: "Internal server error",
        error: error.message,
        status: 500,
      });
  }
};
