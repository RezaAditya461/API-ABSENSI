import express from "express";
import { createClass, getAllClasses, getClassById, updateClass, deleteClass, getClass } from "../controller/class.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/create', createClass);
router.get('/list', getAllClasses);
router.get('/:id', verifyToken, getClassById);
router.put('/:id', verifyToken, updateClass);
router.delete('/:id', verifyToken, deleteClass);
router.get('/', verifyToken, getClass);

export default router;