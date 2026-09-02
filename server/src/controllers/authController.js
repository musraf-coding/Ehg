import bcrypt from 'bcryptjs'

import {
  findUserByEmail,
  updateLastLogin,
} from '../models/userModel.js'

import generateToken from '../utils/generateToken.js'

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await findUserByEmail(normalizedEmail)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact the administrator.',
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const token = generateToken(user)

    await updateLastLogin(user.id)

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        status: user.status,
      },
    })
  } catch (error) {
    next(error)
  }
}


export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      department: req.user.department,
      status: req.user.status,
      lastLoginAt: req.user.last_login_at,
    },
  })
}