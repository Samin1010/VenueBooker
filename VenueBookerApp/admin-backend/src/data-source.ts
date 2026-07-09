import { DataSource } from "typeorm"
import dotenv from "dotenv"
import "reflect-metadata";
import { UserAccount } from "./entities/UserAccount";
import { VenueProperty } from "./entities/VenueProperty";
import { VenueApplication } from "./entities/VenueApplication";
import { BookedTime } from "./entities/BookedTime";
import { AddOriginalVenuePrice1718150400000 } from "./migrations/1718150400000-AddOriginalVenuePrice";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false, // Use this for Azure SQL Database
        //trustedConnection: false // Use this for Windows Authentication (if applicable)
    },
    // the database schema should be auto created every time the application loads
    synchronize: false, 
    logging: false, // Enable logging for debugging purposes
    entities: [UserAccount,VenueProperty,VenueApplication,BookedTime], // Register the Tutorial entity with TypeORM, allowing it to manage the corresponding database table and perform CRUD operations based on the defined schema.
    migrations: [AddOriginalVenuePrice1718150400000],
    migrationsRun: true,
    subscribers: [],
});
