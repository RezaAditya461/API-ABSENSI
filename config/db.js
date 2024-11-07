import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize (
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected...");
    } catch (error) {
        console.error("Unable to connect to database:", error);
    }
})();