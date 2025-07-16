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

return multer({ storage })
}