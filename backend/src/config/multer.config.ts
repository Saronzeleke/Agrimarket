/**
 * Multer Configuration for File Uploads
 * 
 * Uses memoryStorage to enable magic number validation
 */

import multer from 'multer'
import config from './env'

// Use memory storage to enable buffer-based magic number validation
const storage = multer.memoryStorage()

// File filter (basic MIME type check, magic numbers validated in middleware)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images only (will be verified by magic numbers in middleware)
  const allowedMimes = config.upload.allowedImageTypes
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only images are allowed'))
  }
}

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxImagesPerProduct,
  },
})

export default upload
