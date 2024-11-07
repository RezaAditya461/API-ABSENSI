import { StudentData, Class, User, } from "../models/index.js";
import { Op } from "sequelize";

export const createStudentData = async (req, res) => {
    try {
        const { fullname, nisn, jenis_kelamin, classId } = req.body;

        if (!fullname || !nisn || !jenis_kelamin || !classId) {
            return res.status(400).json({
                message: "Semua kolom harus terisi",
                success: false
            });
        }

        const existingClass = await Class.findOne({ where: { id: classId } });
        if (!existingClass) {
            return res.status(400).json({
                message: "classId tidak valid",
                success: false
            });
        }

        const newStudent = await StudentData.create({
            fullname,
            nisn,
            jenis_kelamin,
            classId
        });

        return res.status(201).json({
            message: 'Data siswa berhasil ditambahkan',
            success: true,
            data: {
                id: newStudent.id,
                fullname: newStudent.fullname,
                nisn: newStudent.nisn,
                jenis_kelamin: newStudent.jenis_kelamin,
                classId: newStudent.classId // Menyertakan classId jika diperlukan
            }
        });
    } catch (error) {
        console.error("Kesalahan saat menambahkan data siswa", error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server",
            success: false
        });
    }
};

export const getAllStudentData = async (req, res) => {
    try {
        const students = await StudentData.findAll({
            include: [
                {
                    model: Class,
                    attributes: ['id', 'kelas'],
                },
            ],
        });

        if (students.length === 0) {
            return res.status(404).json({
                message: 'Tidak ada data siswa ditemukan',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Data siswa berhasil diambil',
            success: true,
            data: students,
        });
    } catch (error) {
        console.error('Kesalahan saat mengambil data siswa:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};

export const deleteStudentData = async (req, res) => {
    try {
        const { id } = req.params;

        const studentdata = await StudentData.findByPk(id);
        if (!studentdata) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan',
                success: false
            });
        }

        await studentdata.destroy();

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

export const updateStudentData = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, nisn, jenis_kelamin } = req.body; // Hapus classId dari destructuring

        const studentdata = await StudentData.findByPk(id);
        if (!studentdata) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan',
                success: false
            });
        }

        // Update field yang ada dalam request body
        if (fullname) {
            studentdata.fullname = fullname;
        }

        if (nisn) {
            studentdata.nisn = nisn;
        }

        if (jenis_kelamin) {
            studentdata.jenis_kelamin = jenis_kelamin;
        }

        await studentdata.save();

        return res.status(200).json({
            message: 'Pengguna berhasil diperbarui',
            success: true,
            data: studentdata
        });
    } catch (error) {
        console.error('Kesalahan saat memperbarui pengguna:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};

export const getStudentDataByClass = async (req, res) => {
    try {
        // Ambil userId dari informasi pengguna yang sedang login
        const userId = req.user.id; // ambil userId dari informasi pengguna yang sedang login

        // Cari informasi pengguna berdasarkan userId
        const user = await User.findByPk(userId); // Pastikan Anda mengimpor model User
        if (!user) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan',
                success: false,
            });
        }

        // Ambil classId dari informasi pengguna
        const userClassId = user.classId; // asumsikan ada relasi dengan classId di model User

        // Cari semua data siswa yang berada di kelas yang sama
        const students = await StudentData.findAll({
            where: { classId: userClassId },
            include: [
                {
                    model: Class,
                    attributes: ['id', 'kelas'],
                },
            ],
        });

        if (students.length === 0) {
            return res.status(404).json({
                message: 'Tidak ada data siswa ditemukan di kelas ini',
                success: false,
            });
        }

        return res.status(200).json({
            message: 'Data siswa berhasil diambil',
            success: true,
            data: students,
        });
    } catch (error) {
        console.error('Kesalahan saat mengambil data siswa berdasarkan kelas:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};

export const getStudentData = async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = limit * page;

    try {
        const totalRows = await StudentData.count({
            where: {
                [Op.or]: [
                    { fullname: { [Op.like]: '%' + search + '%' } }, // Pencarian berdasarkan fullname
                    { nisn: { [Op.like]: '%' + search + '%' } }, // Pencarian berdasarkan nisn
                    { jenis_kelamin: { [Op.like]: '%' + search + '%' } } // Pencarian berdasarkan jenis kelamin
                ]
            }
        });
        const totalPage = Math.ceil(totalRows / limit);

        const result = await StudentData.findAll({
            where: {
                [Op.or]: [
                    { fullname: { [Op.like]: '%' + search + '%' } },
                    { nisn: { [Op.like]: '%' + search + '%' } },
                    { jenis_kelamin: { [Op.like]: '%' + search + '%' } }
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
            message: result.length ? "Data siswa berhasil diambil" : "Data siswa kosong"
        });
    } catch (error) {
        console.error("Error fetching student data:", error);
        res.status(500).json({ 
            message: "Terjadi kesalahan saat mengambil data siswa.",
            success: false
        });
    }
};
