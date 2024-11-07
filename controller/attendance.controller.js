import { Op } from "sequelize";
import dotenv from "dotenv";
import moment from "moment";
import { Attendance, StudentData, Class, User } from "../models/index.js"

dotenv.config();

export const markAttendance = async (req, res) => {
    try {
        const { status, studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({
                message: 'student tidak ada',
                success: false
            });
        }
        if (!status) {
            return res.status(400).json({
                message: 'status harus terisi',
                success: false
            });
        }

        const currentdate = new Date();
        const formattedDate = moment(currentdate).format('YYYY-MM-DD');

        const existingAttendance = await Attendance.findOne({
            where: { studentId, date: formattedDate }
        });

        if (existingAttendance) {
            return res.status(400).json({
                message: 'Pengguna ini sudah absen hari ini',
                success: false
            });
        }

        const user = await StudentData.findByPk(studentId);
        if (!user) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan',
                success: false
            });
        }

        const classId = user.classId;
        
        if (!classId) {
            return res.status(400).json({
                message: 'Kelas pengguna tidak ditemukan',
                success: false
            });
        }

        const attendance = await Attendance.create({ studentId, classId, date: formattedDate, status });

        return res.status(201).json({
            message: 'Berhasil melakukan absensi',
            success: true,
            attendance: {
                ...attendance.dataValues,
                classId
            }
        });
    } catch (error) {
        console.error('Kesalahan menandai kehadiran:', error);
        return res.status(500).json({
            message: 'Kesalahan pada server',
            success: false
        });
    }
};

export const getAttendanceToday = async (req, res) => {
    try {
        const today = new Date();
        const startDate = new Date(today.setHours(0, 0, 0, 0));
        const endDate = new Date(today.setHours(23, 59, 59, 999));

        const attendanceToday = await Attendance.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: StudentData,
                    as: 'student',
                    attributes: ['fullname', 'nisn']
                },
                {
                    model: Class,
                    as: 'class',
                    attributes: ['kelas']
                }
            ]
        });

        if (attendanceToday.length === 0) {
            return res.status(200).json({
                message: 'Tidak ada catatan absensi ditemukan untuk hari ini.',
                success: true,
                data: []
            });
        }        

        return res.status(200).json({
            message: 'Absensi hari ini',
            success: true,
            data: attendanceToday,
        });
    } catch (error) {
        console.error('Kesalahan saat mendapatkan absensi hari ini:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};

export const getAttendanceTodayByUserClass = async (req, res) => {
    try {
        const today = new Date();
        const startDate = new Date(today.setHours(0, 0, 0, 0));
        const endDate = new Date(today.setHours(23, 59, 59, 999));

        // Mengambil classId dari pengguna yang sedang login
        const userId = req.userId; // Pastikan Anda sudah menyimpan userId saat login
        const user = await User.findByPk(userId); // Mengambil data pengguna berdasarkan ID

        if (!user || !user.classId) {
            return res.status(400).json({
                message: 'Pengguna tidak terdaftar dalam kelas.',
                success: false,
            });
        }
        console.log(user.classId)
        const attendanceToday = await Attendance.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
                classId: user.classId // Mengambil absensi berdasarkan classId pengguna
            },
            include: [
                {
                    model: StudentData,
                    as: 'student',
                    attributes: ['fullname', 'nisn']
                },
                {
                    model: Class,
                    as: 'class',
                    attributes: ['kelas']
                }
            ]
        });

        if (attendanceToday.length === 0) {
            return res.status(200).json({
                message: 'Tidak ada catatan absensi ditemukan untuk hari ini.',
                success: true,
                data: []
            });
        }        

        return res.status(200).json({
            message: 'Absensi hari ini',
            success: true,
            data: attendanceToday,
        });
    } catch (error) {
        console.error('Kesalahan saat mendapatkan absensi hari ini:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};


export const getAttendanceYesterdayByUserClass = async (req, res) => {
    try {
        // Mendapatkan tanggal kemarin
        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

        const userId = req.userId; // Pastikan Anda sudah menyimpan userId saat login
        const user = await User.findByPk(userId); // Mengambil data pengguna berdasarkan ID

        if (!user || !user.classId) {
            return res.status(400).json({
                message: 'Pengguna tidak terdaftar dalam kelas.',
                success: false,
            });
        }

        const attendancesYesterday = await Attendance.findAll({
            where: {
                date: yesterday,
                classId: user.classId
            },
            include: [
                {
                    model: StudentData,
                    as: 'student',
                    attributes: ['fullname', 'nisn']
                },
                {
                    model: Class,
                    as: 'class',
                    attributes: ['kelas']
                }
            ]
        });

        if (attendancesYesterday.length === 0) {
            return res.status(200).json({
                message: 'Tidak ada catatan absensi ditemukan untuk kemarin.',
                success: true,
                data: []
            });
        }

        return res.status(200).json({
            message: 'Absensi kemarin',
            success: true,
            data: attendancesYesterday,
        });
    } catch (error) {
        console.error('Kesalahan saat mendapatkan absensi kemarin:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};

export const getAttendance = async (req, res) => {
    try {
        // Ambil semua data absensi tanpa filter
        const attendances = await Attendance.findAll({
            include: [
                {
                    model: StudentData,
                    as: 'student',
                    attributes: ['id', 'fullname', 'nisn', 'jenis_kelamin', 'classId'],
                },
                {
                    model: Class,
                    as: 'class',
                    attributes: ['id', 'kelas', 'angkatan'],
                },
            ],
        });

        return res.status(200).json({
            message: 'Berhasil mengambil semua data absensi',
            success: true,
            attendance: attendances.map((attendance) => ({
                id: attendance.id,
                date: attendance.date,
                status: attendance.status,
                student: attendance.student ? {
                    id: attendance.student.id,
                    fullname: attendance.student.fullname,
                    nisn: attendance.student.nisn,
                    jenis_kelamin: attendance.student.jenis_kelamin,
                    classId: attendance.student.classId,
                } : null,
                class: attendance.class ? {
                    id: attendance.class.id,
                    kelas: attendance.class.kelas,
                    angkatan: attendance.class.angkatan,
                } : null,
            })),
        });
    } catch (error) {
        console.error('Kesalahan mengambil semua data absensi:', error);
        return res.status(500).json({
            message: 'Kesalahan pada server',
            success: false,
        });
    }
};

export const getAbsensiDashboard = async (req, res) => {
    try {
        const attendances = await Attendance.findAll();

        const dashboardData = {
            Hadir: 0,
            Sakit: 0,
            Izin: 0,
            Alpa: 0,
        };

        attendances.forEach(attendance => {
            if (attendance.status === 'Hadir') {
                dashboardData.Hadir += 1;
            } else if (attendance.status === 'Izin') {
                dashboardData.Izin += 1;
            } else if (attendance.status === 'Sakit') {
                dashboardData.Sakit += 1;
            } else if (attendance.status === 'Alpa') {
                dashboardData.Alpa += 1;
            }
        });

        return res.status(200).json({
            message: 'Data dashboard berhasil diambil',
            success: true,
            data: dashboardData,
        });
    } catch (error) {
        console.error('Kesalahan saat mengambil data dashboard:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};

export const getClassesWithoutAttendance = async (req, res) => {
    try {
        // Ambil tanggal hari ini
        const today = moment().startOf('day').toDate();

        // Ambil semua kelas
        const classes = await Class.findAll({
            include: [
                {
                    model: Attendance,
                    as: 'attendances',
                    where: {
                        createdAt: {
                            [Op.gte]: today
                        }
                    },
                    required: false // untuk mengambil kelas yang tidak memiliki absensi hari ini
                }
            ]
        });

        // Filter kelas yang tidak memiliki absensi hari ini
        const classesWithoutAttendance = classes.filter(cls => cls.attendances.length === 0);

        return res.status(200).json({
            message: 'Data kelas yang belum absen berhasil diambil',
            success: true,
            data: classesWithoutAttendance.map(cls => ({
                classId: cls.id,
                className: cls.kelas
            }))
        });
    } catch (error) {
        console.error('Kesalahan saat mengambil data kelas yang belum absen:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};

export const getAttendanceYesterday = async (req, res) => {
    try {
        // Mendapatkan tanggal kemarin
        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

        const attendancesYesterday = await Attendance.findAll({
            where: {
                date: yesterday
            },
            include: [
                {
                    model: StudentData,
                    as: 'student',
                    attributes: ['fullname', 'nisn']
                },
                {
                    model: Class,
                    as: 'class',
                    attributes: ['kelas']
                }
            ]
        });

        if (attendancesYesterday.length === 0) {
            return res.status(200).json({
                message: 'Tidak ada catatan absensi ditemukan untuk kemarin.',
                success: true,
                data: []
            });
        }

        return res.status(200).json({
            message: 'Absensi kemarin',
            success: true,
            data: attendancesYesterday,
        });
    } catch (error) {
        console.error('Kesalahan saat mendapatkan absensi kemarin:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};

export const getAttendanceByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, classId } = req.query;

        // Validasi input tanggal
        if (!startDate || !endDate || !classId) {
            return res.status(400).json({
                message: 'Tanggal mulai dan tanggal akhir harus disediakan',
                success: false
            });
        }

        // Mengonversi tanggal ke format yang sesuai
        const formattedStartDate = moment(startDate).startOf('day').toDate();
        const formattedEndDate = moment(endDate).endOf('day').toDate();

        const attendance = await Attendance.findAll({
            where: {
                createdAt: {
                    [Op.between]: [formattedStartDate, formattedEndDate]
                },
                classId: classId
            },
            include: [
                {
                    model: StudentData,
                    as: 'student',
                    attributes: ['fullname', 'nisn']
                },
                {
                    model: Class,
                    as: 'class',
                    attributes: ['kelas']
                }
            ]
        });

        if (attendance.length === 0) {
            return res.status(200).json({
                message: 'Tidak ada catatan absensi ditemukan untuk rentang tanggal tersebut.',
                success: true,
                data: []
            });
        }

        return res.status(200).json({
            message: 'Absensi berdasarkan rentang tanggal',
            success: true,
            attendance,
        });
    } catch (error) {
        console.error('Kesalahan saat mendapatkan absensi berdasarkan rentang tanggal:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};

export const getAttendanceWeek = async (req, res) => {
    try {
        const today = moment();
        const startOfWeek = today.clone().startOf('week').format('YYYY-MM-DD');
        const endOfWeek = today.clone().endOf('week').format('YYYY-MM-DD');

        const attendanceWeek = await Attendance.findAll({
            where: {
                date: {
                    [Op.between]: [startOfWeek, endOfWeek]
                }
            },
            include: [
                {
                    model: StudentData,
                    as: 'student',
                    attributes: ['fullname', 'nisn']
                },
                {
                    model: Class,
                    as: 'class',
                    attributes: ['kelas']
                }
            ]
        });

        if (attendanceWeek.length === 0) {
            return res.status(200).json({
                message: 'Tidak ada catatan absensi ditemukan untuk minggu ini.',
                success: true,
                data: []
            });
        }

        return res.status(200).json({
            message: 'Absensi minggu ini',
            success: true,
            data: attendanceWeek,
        });
    } catch (error) {
        console.error('Kesalahan saat mendapatkan absensi minggu ini:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            success: false,
        });
    }
};
