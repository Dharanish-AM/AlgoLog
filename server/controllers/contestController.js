const Contest = require("../models/contestSchema");
const axios = require("axios");

/**
 * Fetch contests from LeetCode GraphQL API
 */
const fetchContestsFromLeetCode = async () => {
  const query = `
    query {
      allContests {
        title
        titleSlug
        startTime
        duration
        isVirtual
      }
    }
  `;

  const response = await axios.post(
    "https://leetcode.com/graphql",
    { query },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data.allContests;
};

/**
 * Get all contests - from DB if available, otherwise fetch from LeetCode
 */
const getAllContests = async (req, res) => {
  try {
    // Check if we have contests in DB
    const contestsCount = await Contest.countDocuments();

    if (contestsCount > 0) {
      // Return from database
      const contests = await Contest.find().sort({ startTime: -1 }).lean();
      console.log(`✅ Returning ${contests.length} contests from database`);
      
      return res.status(200).json({
        contests,
        source: "database",
        count: contests.length,
      });
    }

    // If DB is empty, fetch from LeetCode and save
    console.log("📥 No contests in DB, fetching from LeetCode...");
    const leetcodeContests = await fetchContestsFromLeetCode();

    // Save to database (bulk insert with upsert to avoid duplicates)
    const bulkOps = leetcodeContests.map((contest) => ({
      updateOne: {
        filter: { titleSlug: contest.titleSlug },
        update: { $set: contest },
        upsert: true,
      },
    }));

    await Contest.bulkWrite(bulkOps);
    console.log(`✅ Saved ${leetcodeContests.length} contests to database`);

    // Return fresh data
    const savedContests = await Contest.find().sort({ startTime: -1 }).lean();
    
    res.status(200).json({
      contests: savedContests,
      source: "leetcode",
      count: savedContests.length,
    });
  } catch (error) {
    console.error("❌ Error fetching contests:", error);
    res.status(500).json({
      error: "Failed to fetch contests",
      message: error.message,
    });
  }
};

/**
 * Refetch contests from LeetCode and update database
 */
const refetchContests = async (req, res) => {
  try {
    console.log("🔄 Refetching contests from LeetCode...");
    
    // Fetch fresh data from LeetCode
    const leetcodeContests = await fetchContestsFromLeetCode();

    // Clear existing contests and insert fresh data
    await Contest.deleteMany({});
    console.log("🗑️  Cleared old contests from database");

    // Bulk insert new contests
    const bulkOps = leetcodeContests.map((contest) => ({
      updateOne: {
        filter: { titleSlug: contest.titleSlug },
        update: { $set: contest },
        upsert: true,
      },
    }));

    const result = await Contest.bulkWrite(bulkOps);
    console.log(`✅ Updated ${result.upsertedCount + result.modifiedCount} contests in database`);

    // Return updated contests
    const updatedContests = await Contest.find().sort({ startTime: -1 }).lean();

    res.status(200).json({
      contests: updatedContests,
      source: "leetcode",
      refetched: true,
      count: updatedContests.length,
      message: "Contests successfully refetched and updated",
    });
  } catch (error) {
    console.error("❌ Error refetching contests:", error);
    res.status(500).json({
      error: "Failed to refetch contests",
      message: error.message,
    });
  }
};

/**
 * Get contest statistics
 */
const getContestStats = async (req, res) => {
  try {
    const totalContests = await Contest.countDocuments();
    const latestContest = await Contest.findOne().sort({ startTime: -1 });
    const oldestUpdate = await Contest.findOne().sort({ updatedAt: 1 });

    res.status(200).json({
      totalContests,
      latestContest: latestContest?.title || null,
      lastUpdated: oldestUpdate?.updatedAt || null,
    });
  } catch (error) {
    console.error("❌ Error getting contest stats:", error);
    res.status(500).json({
      error: "Failed to get contest statistics",
      message: error.message,
    });
  }
};

module.exports = {
  getAllContests,
  refetchContests,
  getContestStats,
};
