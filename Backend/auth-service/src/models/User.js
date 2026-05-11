import mongoose from 'mongoose'
import { USER_ROLES } from '../../../shared/src/constants/roles.js'

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, required: true },
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true },
)

const User = mongoose.model('User', userSchema)

export default User
