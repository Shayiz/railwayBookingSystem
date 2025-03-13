const PORT = process.env.PORT || 4200;
import { connectToDB } from "./database";
import app from "./app";

async function run() {
  try {
    await connectToDB();
    console.log("Database connection established successfully");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}

run();
