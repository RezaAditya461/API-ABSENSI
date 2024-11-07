import Attendance from "../models/models.attendance.js";
import Class from "../models/models.class.js";
import StudentData from "../models/models.studentdata.js";
import { Op } from "sequelize";

export const createClass = async (req, res) => {
    try {
        const { angkatan, kelas } = req.body;

        if (!angkatan || !kelas) {
            return res.status(400).json({
                message: 'Semua kolom harus terisi',
                success: false
            });
        }

        const newClass = await Class.create({
            angkatan,
            kelas
        });

        return res.status(201).json({
            message: 'Data kelas berhasil dibuat',
            success: true,
            class: newClass
        });
    } catch (error) {
        console.error('Kesalahan membuat data kelas', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};

export const getAllClasses = async (req, res) => {
    try {
       const classes = await Class.findAll();
        return res.status(200).json({
            message: 'Berhasil mendapatkan semua data kelas',
            success: true,
            classes
        });
    } catch (error) {
        console.error('Keslahan mendapatkan data kelas', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};

export const getClassById = async (req, res) => {
    try {
        const { id } = req.params;
        const studentClass = await Class.findByPk(id);

        if (!studentClass) {
            return res.status(404).json({
                message: 'Data kelas tidak ditemukan',
                success: false
            });
        }

        return res.status(200).json({
            message: 'Berhasil mendapatkan data kelas',
            success: true,
            class: studentClass
        });

    } catch (error) {
        console.error('Kesalahan mendapatkan data kelas', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};
export const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { jurusan, kelas } = req.body;

        const studentClass = await Class.findByPk(id);
        if (!studentClass) {
            return res.status(404).json({
                message: 'Data kelas tidak ditemukan',
                success: false
            });
        }

        studentClass.jurusan = jurusan || studentClass.jurusan;
        studentClass.kelas = kelas || studentClass.kelas;

        await studentClass.save();

        return res.status(200).json({
            message: 'Data kelas berhasil diperbarui',
            success: true,
            class: studentClass
        });
        
    } catch (error) {
        console.error('Kesalahan memperbarui data kelas', error);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server",
            success: false
        });
    }
};

export const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const studentClass = await Class.findByPk(id);
        if(!studentClass) {
            return res.status(404).json({
                message: 'Data kelas tidak ditemukan',
                success: false
            });
        }

        await studentClass.destroy();

        return res.status(200).json({
            message: 'Data kelas berhasil dihapus',
            success: true
        });

    } catch (error) {
        console.error('Kesalahan menghapus data kelas', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false
        });
    }
};

export const getClass = async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = limit * page;

    try {
        const totalRows = await Class.count({
            where: {
                [Op.or]: [
                    { angkatan: { [Op.like]: '%' + search + '%' } }, // Pencarian berdasarkan angkatan
                    { kelas: { [Op.like]: '%' + search + '%' } } // Pencarian berdasarkan kelas
                ]
            }
        });
        const totalPage = Math.ceil(totalRows / limit);

        const result = await Class.findAll({
            where: {
                [Op.or]: [
                    { angkatan: { [Op.like]: '%' + search + '%' } }, // Pencarian berdasarkan angkatan
                    { kelas: { [Op.like]: '%' + search + '%' } } // Pencarian berdasarkan kelas
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
            message: "Data kelas berhasil diambil"
        });
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ 
            message: "Terjadi kesalahan saat mengambil data kelas.",
            success: false
        });
    }
};
