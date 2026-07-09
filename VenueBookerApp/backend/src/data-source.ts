import { DataSource } from "typeorm"
import dotenv from "dotenv"
import "reflect-metadata";
import { User } from "./entity/User";
import { Venue } from "./entity/Venue";
// import { Booking } from "./entity/Booking";
import { UserPreference } from "./entity/UserPreference";
import { Application } from "./entity/Application";
import { BookedTime } from "./entity/BookedTime";
import { Notification } from "./entity/Notification";
import { UserDocument } from "./entity/UserDocument";
import { Review } from "./entity/Review";

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
    synchronize: true, 
    dropSchema : true,
    logging: false, // Enable logging for debugging purposes
    entities: [User,Venue,UserPreference,Application,Notification,BookedTime,UserDocument,Review], // Register the Tutorial entity with TypeORM, allowing it to manage the corresponding database table and perform CRUD operations based on the defined schema.
    migrations: [],
    subscribers: [],
});
