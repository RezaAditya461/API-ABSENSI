import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Attendance = sequelize.define('Attendance', {
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    classId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Hadir', 'Izin', 'Sakit', 'Alpa'),
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY, // Menyimpan hanya tanggal
        allowNull: false,
        defaultValue: DataTypes.NOW // Menetapkan tanggal saat ini sebagai default
    },
}, { timestamps: true });

export default Attendance;
