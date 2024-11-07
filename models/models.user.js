import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Class from "./models.class.js"; // Pastikan jalur ini benar

const User = sequelize.define('User', {
    fullname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nisn: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    jenis_kelamin: {
        type: DataTypes.ENUM('Laki-Laki', 'Perempuan'),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user' // Nilai default jika diperlukan
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    classId: {
        type: DataTypes.INTEGER,
        references: {
            model: Class,
            key: 'id'
        }
    },
    
}, { timestamps: true });


export default User;
