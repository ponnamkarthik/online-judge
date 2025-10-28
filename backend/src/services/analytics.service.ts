import mongoose from 'mongoose';

import { User } from '../models/user.model';
import { Problem } from '../models/problem.model';
import { Submission } from '../models/submission.model';

export async function getGlobalAnalytics() {
  const [
    totalUsers,
    totalProblems,
    totalSubmissions,
    problemsByDifficulty,
    languageDistribution,
    recentActivity,
  ] = await Promise.all([
    // Total counts
    User.countDocuments(),
    Problem.countDocuments(),
    Submission.countDocuments(),

    // Problems by difficulty
    Problem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $project: { difficulty: '$_id', count: 1, _id: 0 } },
    ]),

    // Language usage distribution
    Submission.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $project: { language: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),

    // Recent activity (last 7 days)
    Submission.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          submissions: { $sum: 1 },
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          submissions: 1,
          passed: 1,
          _id: 0,
        },
      },
    ]),
  ]);

  const successRate =
    totalSubmissions > 0
      ? await Submission.countDocuments({ passed: true }).then((passed) =>
          ((passed / totalSubmissions) * 100).toFixed(2)
        )
      : '0.00';

  return {
    overview: {
      totalUsers,
      totalProblems,
      totalSubmissions,
      globalSuccessRate: `${successRate}%`,
    },
    problemsByDifficulty,
    languageDistribution,
    recentActivity,
  };
}

export async function getUserAnalytics(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [userSubmissions, solvedProblems, languageStats, recentSubmissions] = await Promise.all([
    // Total submissions
    Submission.countDocuments({ user: userObjectId }),

    // Unique solved problems
    Submission.aggregate([
      { $match: { user: userObjectId, passed: true } },
      { $group: { _id: '$pid' } },
      { $count: 'count' },
    ]).then((res) => res[0]?.count || 0),

    // Language usage by user
    Submission.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: '$language',
          total: { $sum: 1 },
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
      {
        $project: {
          language: '$_id',
          total: 1,
          passed: 1,
          successRate: {
            $concat: [
              {
                $toString: {
                  $round: [{ $multiply: [{ $divide: ['$passed', '$total'] }, 100] }, 2],
                },
              },
              '%',
            ],
          },
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]),

    // Recent submissions
    Submission.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('pid language passed createdAt')
      .lean(),
  ]);

  const successRate =
    userSubmissions > 0
      ? await Submission.countDocuments({ user: userObjectId, passed: true }).then((passed) =>
          ((passed / userSubmissions) * 100).toFixed(2)
        )
      : '0.00';

  return {
    overview: {
      totalSubmissions: userSubmissions,
      problemsSolved: solvedProblems,
      successRate: `${successRate}%`,
    },
    languageStats,
    recentSubmissions,
  };
}

export async function getProblemAnalytics(pid: number) {
  const problem = await Problem.findOne({ pid }).lean();
  if (!problem) return null;

  const [totalSubmissions, uniqueUsers, languageStats, successDistribution] = await Promise.all([
    // Total submissions for this problem
    Submission.countDocuments({ pid }),

    // Unique users who attempted
    Submission.aggregate([
      { $match: { pid } },
      { $group: { _id: '$user' } },
      { $count: 'count' },
    ]).then((res) => res[0]?.count || 0),

    // Language usage for this problem
    Submission.aggregate([
      { $match: { pid } },
      {
        $group: {
          _id: '$language',
          total: { $sum: 1 },
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
      {
        $project: {
          language: '$_id',
          submissions: '$total',
          passed: 1,
          _id: 0,
        },
      },
      { $sort: { submissions: -1 } },
    ]),

    // Success rate distribution
    Submission.aggregate([
      { $match: { pid } },
      {
        $group: {
          _id: null,
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
          failed: { $sum: { $cond: ['$passed', 0, 1] } },
        },
      },
    ]).then((res) => res[0] || { passed: 0, failed: 0 }),
  ]);

  const acceptanceRate =
    totalSubmissions > 0
      ? ((successDistribution.passed / totalSubmissions) * 100).toFixed(2)
      : '0.00';

  return {
    problem: {
      pid: problem.pid,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
    },
    stats: {
      totalSubmissions,
      uniqueUsers,
      acceptanceRate: `${acceptanceRate}%`,
    },
    successDistribution,
    languageStats,
  };
}

export async function getLeaderboard(limit = 20) {
  const leaderboard = await Submission.aggregate([
    { $match: { passed: true } },
    {
      $group: {
        _id: '$user',
        problemsSolved: { $addToSet: '$pid' },
        totalSubmissions: { $sum: 1 },
      },
    },
    {
      $project: {
        userId: '$_id',
        problemsSolved: { $size: '$problemsSolved' },
        totalSubmissions: 1,
        _id: 0,
      },
    },
    { $sort: { problemsSolved: -1, totalSubmissions: 1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        username: '$user.username',
        email: '$user.email',
        problemsSolved: 1,
        totalSubmissions: 1,
      },
    },
  ]);

  return { leaderboard };
}
