import Attendance from "./models.attendance.js";
import Class from "./models.class.js";
import StudentData from "./models.studentdata.js";
import User from "./models.user.js";

// Definisikan asosiasi di sini
Class.hasMany(StudentData, {
    onUpdate: "CASCADE",
    foreignKey: "classId"
});
StudentData.belongsTo(Class, {
    foreignKey: "classId"
});

Class.hasMany(User, {
    foreignKey: "classId",
    as: "users"
});
User.belongsTo(Class, { 
    foreignKey: 'classId', 
    as: 'class' 
});

Attendance.belongsTo(Class, { 
    as: 'class', 
    foreignKey: 'classId' 
});
StudentData.hasMany(Attendance, { 
    foreignKey: 'studentId', 
    as: 'attendances' 
});
Attendance.belongsTo(StudentData, { 
    foreignKey: 'studentId', 
    as: 'student' 
});
Class.hasMany(Attendance, { 
    as: 'attendances', 
    foreignKey: 'classId' 
});

    
// Attendance.belongsTo(User, {
//     foreignKey: 'userId',
//     as: 'user'
// });
// User.hasMany(Attendance, {
//     foreignKey: 'userId',   
//     as: 'attendances'
// });

export { Attendance, Class, StudentData, User };
