const Complaint = require('../models/Complaint');

// @desc    Register New Complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = async (req, res) => {
    try {
        const { description, category, latitude, longitude, address } = req.body;

        // Image URL will come from the upload middleware (multer)
        // Normalize path to forward slashes for URL compatibility
        const imageUrl = req.file ? req.file.path.replace(/\\/g, '/') : 'https://via.placeholder.com/400x300?text=No+Image';


        const complaint = await Complaint.create({
            citizen: req.user._id,
            description,
            category,
            imageUrl,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)],
                address
            },
            department: category // Auto-assign to department based on category
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Complaints (with filters)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
    try {
        const { status, category, department } = req.query;
        let query = {};

        if (req.user.role === 'citizen') {
            query.citizen = req.user._id;
        } else if (req.user.role === 'authority') {
            query.department = req.user.department;
        }

        if (status) query.status = status;
        if (category) query.category = category;
        if (department) query.department = department;

        const complaints = await Complaint.find(query)
            .populate('citizen', 'phoneNumber')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Complaint Status/Remarks
// @route   PATCH /api/complaints/:id
// @access  Private (Authority/Admin)
exports.updateComplaint = async (req, res) => {
    try {
        const { status, remarks, priority } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        if (status) complaint.status = status;
        if (remarks) complaint.remarks = remarks;
        if (priority) complaint.priority = priority;

        const updatedComplaint = await complaint.save();
        res.json(updatedComplaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Vote on Complaint
// @route   POST /api/complaints/:id/vote
// @access  Private (Citizen)
exports.voteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if already voted
        if (complaint.votes.includes(req.user._id)) {
            // Remove vote (toggle)
            complaint.votes = complaint.votes.filter(v => v.toString() !== req.user._id.toString());
        } else {
            complaint.votes.push(req.user._id);
        }

        // Auto-update priority based on votes
        const voteCount = complaint.votes.length;
        if (voteCount >= 15) {
            complaint.priority = 'High';
        } else if (voteCount >= 5) {
            complaint.priority = 'Medium';
        } else {
            complaint.priority = 'Low';
        }

        await complaint.save();
        res.json({ votes: complaint.votes.length, priority: complaint.priority });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
