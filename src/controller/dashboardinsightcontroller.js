const Registration = require('../model/user.model');

exports.getDashboardInsights = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const pipeline = [
            {
                $match: { createdAt: { $gte: today } }
            },
            {
                $group: {
                    _id: "$planType",
                    count: { $sum: 1 }
                }
            }
        ];

        const insights = await Registration.aggregate(pipeline);
        
        const formattedInsights = {
            Basic: 0,
            Standard: 0,
            Premium: 0
        };

        insights.forEach(data => {
            formattedInsights[data._id] = data.count;
        });

        res.json({ success: true, insights: formattedInsights });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};


const PLAN_PRICES = {
    'basic': 699,
    'standard': 1999,
    'premium': 2999,
    'Basic Plan': 699,
    'Standard Plan': 1999,
    'Premium Plan': 2999
};

exports.getRecentCustomers = async (req, res) => {
    try {
        const recentCustomers = await Registration.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('fullName planName createdAt');
        
        const formattedCustomers = recentCustomers.map(customer => {
            const planKey = customer.planName.toLowerCase(); // Normalize plan name
            return {
                fullName: customer.fullName,
                planName: customer.planName,
                amount: PLAN_PRICES[planKey] || PLAN_PRICES[customer.planName] || 0,
                createdAt: customer.createdAt
            };
        });

        res.json({ success: true, recentCustomers: formattedCustomers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

const getDayRange = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

exports.getDailyPlanStats  = async (req, res) => {
    try {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const { start: todayStart, end: todayEnd } = getDayRange(today);
        const { start: yesterdayStart, end: yesterdayEnd } = getDayRange(yesterday);

        // Aggregate count for today
        const todayCounts = await Registration.aggregate([
            {
                $match: {
                    planStartDate: { $gte: todayStart, $lte: todayEnd }
                }
            },
            {
                $group: {
                    _id: "$planName",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Aggregate count for yesterday
        const yesterdayCounts = await Registration.aggregate([
            {
                $match: {
                    planStartDate: { $gte: yesterdayStart, $lte: yesterdayEnd }
                }
            },
            {
                $group: {
                    _id: "$planName",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert counts to object format
        const todayData = { standard: 0, premium: 0, basic: 0 };
        const yesterdayData = { standard: 0, premium: 0, basic: 0 };

        todayCounts.forEach(item => {
            todayData[item._id] = item.count;
        });

        yesterdayCounts.forEach(item => {
            yesterdayData[item._id] = item.count;
        });

        // Calculate percentage change
        const result = {};
        Object.keys(todayData).forEach(plan => {
            const todayCount = todayData[plan];
            const yesterdayCount = yesterdayData[plan];

            let percentageChange = 0;
            if (yesterdayCount > 0) {
                percentageChange = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
            } else if (todayCount > 0) {
                percentageChange = 100; // If yesterday was 0 and today has counts, show 100% increase
            }

            result[plan] = {
                todayCount,
                percentageChange: percentageChange.toFixed(2) + "%" // Formatting percentage
            };
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getMostBoughtPlans = async (req, res) => {
    try {
        const planCounts = await Registration.aggregate([
            {
                $group: {
                    _id: "$planName",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalUsers = planCounts.reduce((sum, plan) => sum + plan.count, 0);

        const formattedPlans = planCounts.map(plan => ({
            planName: plan._id,
            noOfUsers: plan.count,
            usagePercent: ((plan.count / totalUsers) * 100).toFixed(2) + "%"
        }));

        res.json({ success: true, mostBoughtPlans: formattedPlans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

exports.getTodayActiveUsers = async (req, res) => {
    try {
        const today = new Date();
        const { start: todayStart, end: todayEnd } = getDayRange(today);

        const plans = ["Basic Plan", "Standard Plan", "Premium Plan"];
        let result = [];

        for (const plan of plans) {
            const activeUsers = await Registration.countDocuments({
                planName: plan,
                lastActiveDate: { $gte: todayStart, $lte: todayEnd }
            });

            result.push({ planName: plan, todayActiveUsers: activeUsers });
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error });
    }
};

