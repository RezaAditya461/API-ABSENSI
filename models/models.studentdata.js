import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const StudentData = sequelize.define('StudentData', {
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
    classId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { timestamps: true });

export default StudentData;
