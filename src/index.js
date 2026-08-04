import dotenv from "dotenv";
import { app } from "./app.js";

// Configuring the dotenv file
dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 7001;
app.listen(7001, () => {
  console.log(`Server is listening on port ${PORT}`);
});
