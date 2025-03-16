import mongoose from "mongoose";

const DB = process.env.DB;
let connection = await mongoose
  .connect(DB)
  .then((e) => console.log("succes"))
  .catch((error) => console.log(error));

export default connection;
