import express from "express";
import userRoutes from "./route/user.route.js";
import dotenv from "dotenv";
import attendanceRoutes from "./route/attendance.route.js";
import ClassRoutes from "./route/class.route.js";
import StudentDataRoutes from "./route/studentdata.route.js";
import cors from "cors";
import { sequelize } from "./config/db.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.get("/", (req, res) => {
    res.status(200).json({
        message: "server is running",
        success: true
    });
});

app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/class', ClassRoutes);
app.use('/api/studentdata', StudentDataRoutes)

const dev = async () => {
    try {
        await sequelize.sync(); // Sinkronisasi database
        console.log("Database connected successfully...");

        const PORT = process.env.PORT || 2020; // Tetapkan default 2020 jika PORT tidak diatur di .env
        app.listen(PORT, () => {
            console.log(`server running on ${PORT}`);
        });
    } catch (error) {
        console.error("Terjadi kesalahan saat menyinkronkan database:", error);
    }
};

dev();
