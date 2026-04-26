import Collaboration from '../models/Collaboration.js';
import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Document from '../models/Document.js';
import mongoose from 'mongoose';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'entrepreneur') {
      // Stats for Entrepreneur
      const [pendingRequestsCount, connectionsCount, upcomingMeetingsCount, totalViews, assetCount] = await Promise.all([
        Collaboration.countDocuments({ entrepreneur: userId, status: 'pending' }),
        Collaboration.countDocuments({ entrepreneur: userId, status: 'accepted' }),
        Meeting.countDocuments({ 
          $or: [{ host: userId }, { participants: userId }],
          status: 'accepted',
          startTime: { $gte: new Date() }
        }),
        Activity.countDocuments({ user: userId, action: 'PROFILE_VIEW' }),
        Document.countDocuments({ uploader: userId })
      ]);

      // Calculate 7-day history for chart
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const viewHistory = await Activity.aggregate([
        {
          $match: {
            user: userId,
            action: 'PROFILE_VIEW',
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // Map to standard 7 day format for frontend
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];
        const dayData = viewHistory.find(h => h._id === dateStr);
        chartData.push({ name: dayName, views: dayData ? dayData.count : 0 });
      }

      stats = {
        pendingRequests: pendingRequestsCount,
        totalConnections: connectionsCount,
        upcomingMeetings: upcomingMeetingsCount,
        profileViews: totalViews,
        assetCount: assetCount,
        synergyRate: connectionsCount > 0 ? (totalViews / (connectionsCount * 10) + 75).toFixed(1) : 0,
        chartData,
        industryDistribution: [] // Safe default for cross-dashboard stability
      };

      // Get latest activities
      const recentActivity = await Activity.find({ user: userId })
        .populate('actor', 'name profile.avatarUrl role')
        .limit(10)
        .sort({ createdAt: -1 });

      const recentRequests = await Collaboration.find({ entrepreneur: userId, status: 'pending' })
        .populate('investor', 'name email profile.avatarUrl')
        .limit(5)
        .sort({ createdAt: -1 });

      return res.json({ stats, recentRequests, recentActivity });

    } else if (userRole === 'investor') {
      // Stats for Investor
      const [connectionsCount, totalEntrepreneurs] = await Promise.all([
        Collaboration.countDocuments({ investor: userId, status: 'accepted' }),
        User.countDocuments({ role: 'entrepreneur' })
      ]);

      // Industry distribution for charts
      const industryDistribution = await User.aggregate([
        { $match: { role: 'entrepreneur' } },
        { $group: { _id: "$profile.industry", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      const industries = await User.distinct('profile.industry', { role: 'entrepreneur' });

      stats = {
        totalStartups: totalEntrepreneurs,
        industries: industries.length,
        yourConnections: connectionsCount,
        portfolioHealth: connectionsCount > 0 ? 88.5 : 0, // High-fidelity demo static
        industryDistribution: industryDistribution.map(item => ({
          name: item._id || 'Other',
          count: item.count
        })),
        chartData: [] // Safe default for cross-dashboard stability
      };

      // Get latest activities (e.g., new startups registered)
      const recentActivity = await Activity.find({ user: userId })
        .populate('actor', 'name profile.avatarUrl role')
        .limit(10)
        .sort({ createdAt: -1 });

      const featuredStartups = await User.find({ role: 'entrepreneur' })
        .select('name email profile.startupName profile.industry profile.location profile.pitchSummary profile.avatarUrl')
        .limit(6)
        .sort({ createdAt: -1 });

      return res.json({ stats, featuredStartups, recentActivity });
    } else if (userRole === 'admin') {
        // Stats for Admin (Global view)
        const [totalUsers, totalEntrepreneurs, totalInvestors, totalDocs] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'entrepreneur' }),
            User.countDocuments({ role: 'investor' }),
            Document.countDocuments()
        ]);

        stats = {
            totalConnections: totalUsers,
            upcomingMeetings: 0,
            profileViews: totalDocs,
            yourConnections: totalInvestors,
            totalStartups: totalEntrepreneurs,
            chartData: [],
            industryDistribution: []
        };

        return res.json({ stats, recentActivity: [] });
    }

    res.status(400).json({ message: 'Invalid user role' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// @desc    Get recent activity feed
// @route   GET /api/dashboard/activity
// @access  Private
export const getActivityFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    const activities = await Activity.find({ user: userId })
      .populate('actor', 'name role')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity feed', error: error.message });
  }
};
