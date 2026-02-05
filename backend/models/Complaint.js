const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    citizen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['PWD', 'Sanitation', 'Water Supply', 'Electricity', 'Drainage', 'Other'],
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: String
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Fake/Invalid'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    remarks: {
        type: String
    },
    department: {
        type: String,
        enum: ['PWD', 'Sanitation', 'Water Supply', 'Electricity', 'Drainage']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

complaintSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Complaint', complaintSchema);
