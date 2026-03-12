const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getStats,
    getAllUsers,
    deleteUser,
    getAllComplaints,
    deleteComplaint,
} = require('../controllers/adminController');

// All routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/complaints', getAllComplaints);
router.delete('/complaints/:id', deleteComplaint);

module.exports = router;
