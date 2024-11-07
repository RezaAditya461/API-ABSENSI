import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Inisialisasi dotenv
dotenv.config();

// Set untuk menyimpan token yang dibatalkan
export const blacklistTokens = new Set();

// Middleware untuk verifikasi token
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Menggunakan optional chaining untuk keamanan

    // Cek apakah token ada
    if (!token) {
        return res.status(401).json({
            message: "Token tidak ditemukan",
            success: false
        });
    }

    // Cek apakah token ada di blacklist
    if (blacklistTokens.has(token)) {
        return res.status(403).json({
            message: 'Token ini telah dibatalkan. Silakan masuk kembali untuk mendapatkan token baru.',
            success: false
        });
    }

    try {
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        // Menyimpan informasi user di request
        req.user = decoded;
        
        // Menyimpan userId di request
        req.userId = decoded.id;
        
        next(); // Melanjutkan ke middleware berikutnya
    } catch (error) {
        return res.status(403).json({
            message: "Token tidak valid",
            success: false
        });
    }
};
