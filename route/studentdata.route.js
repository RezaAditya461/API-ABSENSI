import express from "express";
import { createStudentData, getAllStudentData, deleteStudentData, updateStudentData, getStudentDataByClass, getStudentData } from "../controller/studentdata.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/create', verifyToken, createStudentData);
router.get('/list', verifyToken, getAllStudentData);
router.get('/byUserId', verifyToken, getStudentDataByClass);
router.delete('/:id', verifyToken, deleteStudentData);
router.put('/:id', verifyToken, updateStudentData);
router.get('/get', verifyToken, getStudentData);


export default router;
