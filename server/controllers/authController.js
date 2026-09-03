const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');

// Memory store fallback
const memoryUsers = [
  {
    _id: 'admin_user_01',
    name: 'NEXORA Admin',
    email: 'admin@nexora.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date(),
  },
  {
    _id: 'demo_user_01',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    passwordHash: bcrypt.hashSync('user123', 10),
    role: 'user',
    createdAt: new Date(),
  }
];

const generateToken = (id, role, name, email) => {
  return jwt.sign(
    { id, role, name, email },
    process.env.JWT_SECRET || 'nexora_super_secret_jwt_key_2026_codealpha',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const isDB = getDBStatus();
    const cleanEmail = email.trim().toLowerCase();

    if (isDB) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
      });

      const token = generateToken(user._id, user.role, user.name, user.email);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      const existing = memoryUsers.find((u) => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = {
        _id: `mem_user_${Date.now()}`,
        name,
        email: cleanEmail,
        passwordHash: hashedPassword,
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        createdAt: new Date(),
      };

      memoryUsers.push(newUser);
      const token = generateToken(newUser._id, newUser.role, newUser.name, newUser.email);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully (Local Store)',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isDB = getDBStatus();

    if (isDB) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id, user.role, user.name, user.email);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      const user = memoryUsers.find((u) => u.email === cleanEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = bcrypt.compareSync(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id, user.role, user.name, user.email);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const isDB = getDBStatus();

    if (isDB) {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, user });
    } else {
      const user = memoryUsers.find((u) => u._id === userId);
      if (!user) {
        return res.json({ success: true, user: req.user });
      }
      const { passwordHash, ...userInfo } = user;
      return res.json({ success: true, user: userInfo });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, memoryUsers };
