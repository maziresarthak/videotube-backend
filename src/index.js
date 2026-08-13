import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

// Configuring the dotenv file
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    app.listen(7001, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error ", err);
  });
