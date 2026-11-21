const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_school_mgmt_2026_secure', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const sendTokenResponse = async (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'lax',
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Fetch role-specific profile
  let profile = null;
  if (user.role === 'student') {
    profile = await Student.findOne({ user: user._id })
      .populate('classId', 'name numericGrade')
      .populate('sectionId', 'name roomNumber');
  } else if (user.role === 'teacher') {
    profile = await Teacher.findOne({ user: user._id })
      .populate('assignedClasses.classId', 'name')
      .populate('assignedClasses.sectionId', 'name')
      .populate('assignedClasses.subjectId', 'name code');
  }

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        isActive: user.isActive,
        profile,
      },
    });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact admin.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id })
        .populate('classId', 'name numericGrade')
        .populate('sectionId', 'name roomNumber');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id })
        .populate('assignedClasses.classId', 'name')
        .populate('assignedClasses.sectionId', 'name')
        .populate('assignedClasses.subjectId', 'name code');
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        isActive: user.isActive,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'User logged out successfully' });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Please provide an email' });
  }
  // In demo / production mock, acknowledge request safely
  return res.status(200).json({
    success: true,
    message: `If an account exists with ${email}, password reset instructions have been dispatched. For demo accounts, use Admin@123, Teacher@123, or Student@123.`,
  });
};
