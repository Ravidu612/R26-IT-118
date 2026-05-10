import User from '../models/User.js'

export const createUser = (payload) => User.create(payload)

export const findUserByEmail = (email) => User.findOne({ email: email.toLowerCase() })

export const findUserById = (id) => User.findById(id)

export const saveRefreshTokenHash = async (id, refreshTokenHash) => {
  await User.findByIdAndUpdate(id, { refreshTokenHash }, { new: true })
}
