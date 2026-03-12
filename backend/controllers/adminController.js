const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get system-wide stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
    try {
        const [citizens, authorities, totalComplaints, resolvedComplaints, inProgressComplaints, fakeComplaints] = await Promise.all([
            User.countDocuments({ role: 'citizen' }),
            User.countDocuments({ role: 'authority' }),
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: 'Resolved' }),
            Complaint.countDocuments({ status: 'In Progress' }),
            Complaint.countDocuments({ status: 'Fake/Invalid' }),
        ]);

        res.json({
            citizens,
            authorities,
            totalComplaints,
            resolvedComplaints,
            inProgressComplaints,
            fakeComplaints,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (citizens + authorities)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete an admin account' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all complaints (system-wide, all departments)
// @route   GET /api/admin/complaints
// @access  Private (Admin)
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('citizen', 'phoneNumber name uniqueId')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a complaint (Admin only — for fake/invalid complaints)
// @route   DELETE /api/admin/complaints/:id
// @access  Private (Admin)
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        await complaint.deleteOne();
        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
