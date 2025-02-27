const Feedback = require('../model/feedback.model');

// ✅ Add Feedback
exports.addFeedback = async (req, res) => {
    try {
        const { userId, rating, feedback, others } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const newFeedback = new Feedback({
            userId,
            rating,
            feedback,
            others
        });

        await newFeedback.save();
        res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// ✅ Get All Feedbacks
exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('userId', 'fullName whatsappNumber phoneNumber');

        const formattedFeedbacks = feedbacks.map(fb => ({
            "Full Name": fb.userId.fullName,
            "WhatsApp No": fb.userId.whatsappNumber || "N/A",
            "Alternate No": fb.userId.phoneNumber || "N/A",
            "Rating": fb.rating,
            "Feedback": fb.feedback,
            "Others": fb.others || "N/A",
            "Date & Time": new Date(fb.dateTime).toLocaleString()
        }));

        res.status(200).json(formattedFeedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// ✅ Get Feedbacks by User ID
exports.getFeedbacksByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const feedbacks = await Feedback.find({ userId }).populate('userId', 'fullName email whatsappNo');

        if (!feedbacks.length) {
            return res.status(404).json({ message: 'No feedbacks found for this user' });
        }

        res.status(200).json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
