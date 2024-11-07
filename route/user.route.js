import express from "express";
import { createRegister, loginUser, getAllUsers, updateUser, deleteUser, getUserByIdClass, logoutUser, getUserByName, getUser } from "../controller/user.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/register', createRegister);
router.post('/login', loginUser)
router.get('/list', getAllUsers);
router.get('/fullname', verifyToken , getUserByName);
router.get('/class/:classId', verifyToken, getUserByIdClass);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);
router.post('/logout', verifyToken , logoutUser);
router.get('/get', verifyToken , getUser);

export default router;