const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaint,
    voteComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    }
});

router.route('/')
    .post(protect, upload.single('image'), createComplaint)
    .get(protect, getComplaints);

router.route('/:id')
    .get(protect, getComplaintById)
    .patch(protect, authorize('authority', 'admin'), upload.single('resolutionProof'), updateComplaint);

router.route('/:id/vote')
    .post(protect, authorize('citizen'), voteComplaint);

module.exports = router;
