// @ts-nocheck
const { User } = require('../models/user.model');

/**
 * Toggle a mentor in student's wishlist
 * POST /api/v1/wishlist/toggle/:mentorId
 */
exports.toggleWishlist = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { mentorId } = req.params;

    if (studentId === mentorId) {
      return res.status(400).json({ success: false, message: "You cannot wishlist yourself" });
    }

    const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    const student = await User.findById(studentId);
    const wishlist = student.wishlist || [];
    
    const index = wishlist.indexOf(mentorId);
    let action = 'added';

    if (index > -1) {
      wishlist.splice(index, 1);
      action = 'removed';
    } else {
      wishlist.push(mentorId);
    }

    student.wishlist = wishlist;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Mentor ${action} successfully`,
      action,
      wishlistCount: wishlist.length
    });
  } catch (error) {
    console.error('Wishlist toggle error:', error);
    res.status(500).json({ success: false, message: "Server error toggling wishlist" });
  }
};

/**
 * Get all wishlisted mentors for the logged in student
 * GET /api/v1/wishlist
 */
exports.getWishlist = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId).populate({
      path: 'wishlist',
      select: 'name profileImage mentorProfile role'
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: student.wishlist || []
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: "Server error fetching wishlist" });
  }
};
