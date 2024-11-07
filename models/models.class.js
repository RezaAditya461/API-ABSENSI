import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Class = sequelize.define('Class', {
    id: {
       type: DataTypes.INTEGER,
       primaryKey: true,
       autoIncrement: true 
    },
    angkatan: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kelas: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: true });

export default Class;
