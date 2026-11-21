const Announcement = require('../models/Announcement');
const Student = require('../models/Student');

// @desc Get announcements filtered by user role/class
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { category, priority, role } = req.query;
    const query = {};

    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Filter by role visibility
    if (req.user) {
      if (req.user.role === 'student') {
        const student = await Student.findOne({ user: req.user._id });
        query.$or = [
          { targetRole: 'all' },
          { targetRole: 'student' },
          ...(student ? [{ targetClassId: student.classId }] : []),
        ];
      } else if (req.user.role === 'teacher') {
        query.$or = [{ targetRole: 'all' }, { targetRole: 'teacher' }];
      }
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email role')
      .populate('targetClassId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: announcements.length, data: announcements });
  } catch (error) {
    next(error);
  }
};

// @desc Create announcement (Admin)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetRole, targetClassId, priority, category, expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      targetRole: targetRole || 'all',
      targetClassId: targetClassId || null,
      priority: priority || 'Medium',
      category: category || 'General',
      author: req.user._id,
      expiresAt: expiresAt || null,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'name role')
      .populate('targetClassId', 'name');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update announcement
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('author', 'name role')
      .populate('targetClassId', 'name');

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.status(200).json({ success: true, message: 'Announcement updated', data: announcement });
  } catch (error) {
    next(error);
  }
};

// @desc Delete announcement
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};
