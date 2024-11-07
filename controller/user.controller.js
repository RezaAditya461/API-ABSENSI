import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { blacklistTokens } from '../middleware/auth.js';
import { Op } from 'sequelize';
import { User, Class } from "../models/index.js"

export const createRegister = async (req, res) => {
    try {
        const { fullname, nisn, jenis_kelamin, classId, role, password } = req.body;

        if (!fullname || !nisn || !jenis_kelamin || !password) {
            return res.status(400).json({
                message: 'Semua kolom harus terisi',
                success: false
            });
        }

        const existingUser = await User.findOne({ where: { nisn } });
        if (existingUser) {
            return res.status(400).json({
                message: 'NISN sudah terdaftar, silakan gunakan yang lain',
                success: false
            });
        }

        if (role === 'user') {
            if (!classId) {
                return res.status(400).json({
                    message: 'classId harus diisi jika role adalah user',
                    success: false
                });
            }
            const existingClass = await Class.findOne({ where: { id: classId } });
            if (!existingClass) {
                return res.status(400).json({
                    message: 'classId tidak valid',
                    success: false
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullname,
            nisn,
            jenis_kelamin,
            role,
            password: hashedPassword,
            classId: role === 'admin' ? null : classId
        });

        return res.status(201).json({
            message: 'Pengguna berhasil terdaftar',
            success: true,
            user: {
                id: newUser.id,
                fullname: newUser.fullname,
                nisn: newUser.nisn,
                jenis_kelamin: newUser.jenis_kelamin,
                classId: newUser.classId,
                role: newUser.role
            },
        });
    } catch (error) {
        console.error('Kesalahan saat mendaftar pengguna:', error);
        let errorMessage = 'Terjadi kesalahan pada server';
        if (error.name === 'SequelizeValidationError') {
            errorMessage = 'Data yang Anda masukkan tidak valid';
        } else if (error.name === 'SequelizeForeignKeyConstraintError') {
            errorMessage = 'classId yang diberikan tidak ada di database';
        }

        return res.status(500).json({
            message: errorMessage,
            success: false
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { fullname, nisn, password } = req.body;

        if (!fullname || !nisn || !password) {
            return res.status(400).json({
                message: 'Fullname, NISN, dan password harus disertakan',
                success: false
            });
        }

        const user = await User.findOne({
            where: {
                nisn,
            }
        });

        if (!user) {
            return res.status(401).json({
                message: 'NISN salah',
                success: false
            });
        }

        if (user.fullname !== fullname) {
            return res.status(401).json({
                message: 'Fullname tidak sesuai',
                success: false
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Password tidak sesuai',
                success: false
            });
        }

       const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        const userResponse = {
            id: user.id,
            fullname: user.fullname,
            nisn: user.nisn,
            classId: user.classId,
            jenis_kelamin: user.jenis_kelamin,
            role: user.role,
            token
        };

        return res.status(200).json({
            message: 'Login berhasil',
            success: true,
            data: userResponse,
            
        });

    } catch (error) {
        console.error('Kesalahan saat login pengguna:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};

export const getAllUsers = async (req, res) => {
    const { fullname,  } = req.query;
    try {
        const query = await User.findAll({
            include: { model: Class, as: 'class' }
        });

        let users = query;
        if (fullname) {
            users = users.filter(user => user.fullname.toLowerCase().includes(fullname.toLowerCase()));
        }

        if(users.length === 0) {

            return res.status(404).json({
                message: 'tidak ada pengguna',
                success: true,
                data: users 
            });
        }
        return res.status(200).json({
            message: 'Data pengguna berhasil diambil',
            success: true,
            data: users 
        });

    } catch (error) {
        console.error('Kesalahan saat mengambil data pengguna:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};

export const getUserByIdClass = async (req, res) => {
    try {
        const { classId } = req.params;

        if (!classId) {
            return res.status(400).json({
                message: 'classId harus disertakan',
                success: false
            });
        }

        const users = await User.findAll({
            where: { classId },
            include: { model: Class, as: 'class' }
        });

        if (users.length === 0) {
            return res.status(404).json({
                message: 'Tidak ada pengguna ditemukan untuk kelas ini',
                success: false
            });
        }

        return res.status(200).json({
            message: 'Data pengguna berhasil diambil',
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Kesalahan saat mengambil data pengguna berdasarkan classId:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, password } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan',
                success: false
            });
        }

        // Update fullname
        if (fullname) {
            user.fullname = fullname;
        }

        // Update password
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save(); // Simpan perubahan

        return res.status(200).json({
            message: 'Pengguna berhasil diperbarui',
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Kesalahan saat memperbarui pengguna:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan',
                success: false
            });
        }

        await user.destroy();

        return res.status(200).json({
            message: 'Pengguna berhasil dihapus',
            success: true
        });
    } catch (error) {
        console.error('Kesalahan saat menghapus pengguna:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};

export const logoutUser = (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            blacklistTokens.add(token);
        }

        return res.status(200).json({
            message: "Berhasil logout",
            success: true
        });

    } catch (error) {
        console.error("Kesalahan saat logout", error);
        return res.status(500).json({
            message: "Kesalahan pada server saat logout",
            success: false
        });
    }
};

export const getUserByName = async (req, res) => {
    try {
        const { fullname } = req.query;

        if (!fullname) {
            return res.status(400).json({
                message: "Nama pengguna harus diberikan",
                success: false
            });
        }

        const users = await User.findAll({
            where: {
                fullname: { [Op.like]: `%${fullname}%` },
            },
            include: [
                {
                    model: Class,
                    as: 'class', // Gunakan alias sesuai relasi di file relasi
                    attributes: ['kelas', 'angkatan'],
                },
            ],
            attributes: ['id', 'fullname', 'nisn', 'jenis_kelamin', 'role'],
        });

        res.status(200).json({
            message: "Data pengguna berhasil diambil",
            data: users,
            success: true
        });
    } catch (error) {
        console.error("Kesalahan saat mengambil data pengguna", error);
        res.status(500).json({
            message: "Kesalahan pada server",
            success: false
        });
    }
};

export const getUser = async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = limit * page;

    try {
        const totalRows = await User.count({
            where: {
                [Op.or]: [
                    { fullname: { [Op.like]: '%' + search + '%' } },
                    { nisn: { [Op.like]: '%' + search + '%' } },
                    { jenis_kelamin: { [Op.like]: '%' + search + '%' } },
                    { role: { [Op.like]: '%' + search + '%' } }
                ]
            }
        });
        const totalPage = Math.ceil(totalRows / limit);

        const result = await User.findAll({
            attributes: ['id', 'fullname', 'nisn', 'jenis_kelamin', 'role'], // Tambahkan jenis_kelamin dan role di sini
            where: {
                [Op.or]: [
                    { fullname: { [Op.like]: '%' + search + '%' } },
                    { nisn: { [Op.like]: '%' + search + '%' } },
                    { jenis_kelamin: { [Op.like]: '%' + search + '%' } },
                    { role: { [Op.like]: '%' + search + '%' } }
                ]
            },
            offset: offset,
            limit: limit,
            order: [['id', 'DESC']]
        });

        res.json({
            result: result,
            page: page,
            limit: limit,
            totalRows: totalRows,
            totalPage: totalPage,
            message: "Data pengguna berhasil diambil",
            success: true
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ 
            message: "Terjadi kesalahan saat mengambil data pengguna.",
            success: false
         });
    }
};
