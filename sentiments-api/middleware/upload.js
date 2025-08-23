// middleware/upload.js
import multer from 'multer'
import path from 'path'
import fs from 'fs'

export const getUploader = (folderName = '') => {
    const fullPath = path.join('uploads', folderName)

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
    }


    const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, fullPath) 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
    })

return multer({ storage, fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Only PDF/DOC/DOCX files are allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } })
}