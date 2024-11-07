import express from "express";
import { markAttendance, getAttendanceToday, getAttendance, getAbsensiDashboard, getClassesWithoutAttendance, getAttendanceYesterday, getAttendanceByDateRange, getAttendanceTodayByUserClass, getAttendanceYesterdayByUserClass } from "../controller/attendance.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/mark', verifyToken, markAttendance);
router.get('/today', verifyToken, getAttendanceToday);
router.get('/todayUser', verifyToken, getAttendanceTodayByUserClass);
router.get('/list', verifyToken, getAttendance);
router.get('/dashboard', verifyToken, getAbsensiDashboard);
router.get('/hout', verifyToken, getClassesWithoutAttendance);
router.get('/yesterday', verifyToken, getAttendanceYesterday)
router.get('/yesterdayUser', verifyToken, getAttendanceYesterdayByUserClass)
router.get('/daterange', verifyToken, getAttendanceByDateRange)


export default router;