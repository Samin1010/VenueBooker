import dotenv from "dotenv";
import app from "./utils/server";
import { AppDataSource } from "./data-source";
import { seedDatabase } from "./utils/seedDatabase";

dotenv.config();

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.locals.isReady = false;

app.listen(Number(PORT), HOST, () => {
  console.log(`Server is listening on ${HOST}:${PORT} while the database rebuilds`);
});

// this is given because i want to know
// whether my database is completed 
// removing and re initialized since
// everytime i redeploy it takes
// a lot of time so for those reasons i had
// to do this
async function bootstrap() {
  try {
    console.log("Starting database schema rebuild...");
    console.time("Database schema rebuild");
    await AppDataSource.initialize();
    console.timeEnd("Database schema rebuild");

    console.log("Starting database seed...");
    console.time("Database seed");
    await seedDatabase();
    console.timeEnd("Database seed");

    app.locals.isReady = true;
    console.log("Database rebuild complete. API is ready.");
  } catch (error) {
    console.error("Error during database rebuild:", error);
    process.exit(1);
  }
}

void bootstrap();
