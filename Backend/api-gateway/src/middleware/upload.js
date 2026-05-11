import multer from 'multer'
import AppError from '../utils/AppError.js'

const storage = multer.memoryStorage()

const fileFilter = (_req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    callback(new AppError('Only image uploads are allowed', 400))
    return
  }
  callback(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
})

export default upload
