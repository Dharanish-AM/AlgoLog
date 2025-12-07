const {
  getCodeChefStats,
  getHackerRankStats,
  getLeetCodeStats,
  getGithubStats,
  getSkillrackStats,
  getCodeforcesStats,
} = require("../config/scraper");

async function withRetry(
  promiseFn,
  retries = 1,
  platform = "Unknown",
  identifier = "N/A"
) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      console.debug(`[${platform}] Attempt ${attempt} for ${identifier}`);
      const result = await promiseFn();
      console.info(
        `[${platform}] ✅ Success for ${identifier} on attempt ${attempt}`
      );
      return result;
    } catch (err) {
      console.warn(
        `[${platform}] ❌ Attempt ${attempt} failed for ${identifier}: ${err.message}`
      );
      if (attempt > retries) throw err;
    }
  }
}

function formatError(platform, identifier, extraFields = {}, isUrl = false) {
  const errorMessage = identifier
    ? isUrl
      ? identifier.startsWith("http")
        ? "Failed to fetch"
        : "Invalid URL"
      : "Failed to fetch"
    : isUrl
    ? "URL missing"
    : "Username missing";

  return {
    platform,
    updatedAt: new Date().toISOString(),
    ...extraFields,
    error: errorMessage,
  };
}

async function getStatsForStudent(student, oldStats = {}) {
  const {
    _id,
    name,
    email,
    rollNo,
    year,
    department,
    section,
    leetcode,
    hackerrank,
    codechef,
    codeforces,
    skillrack,
    github,
  } = student;

  console.log(`\n🔍 Starting fetch for student: ${name} (${rollNo})`);

  const platforms = [
    {
      key: "leetcode",
      value: leetcode,
      isUrl: false,
      fetchFn: getLeetCodeStats,
    },
    {
      key: "hackerrank",
      value: hackerrank,
      isUrl: false,
      fetchFn: getHackerRankStats,
    },
    {
      key: "codechef",
      value: codechef,
      isUrl: false,
      fetchFn: getCodeChefStats,
    },
    { key: "github", value: github, isUrl: false, fetchFn: getGithubStats },
    {
      key: "codeforces",
      value: codeforces,
      isUrl: false,
      fetchFn: getCodeforcesStats,
    },
    {
      key: "skillrack",
      value: skillrack,
      isUrl: true,
      fetchFn: getSkillrackStats,
    },
  ];

  const statsEntries = await Promise.allSettled(
    platforms.map(async ({ key, value, isUrl, fetchFn }) => {
      const platformName = key.charAt(0).toUpperCase() + key.slice(1);

      if (!value || (isUrl && !value.startsWith("http"))) {
        console.warn(
          `[${platformName}] ⚠️ Skipping due to invalid or missing identifier.`
        );
        return [
          key,
          oldStats[key] || formatError(platformName, value, {}, isUrl),
        ];
      }

      try {
        const result = await withRetry(
          () => fetchFn(value),
          2,
          platformName,
          value
        );
        return [key, result];
      } catch (err) {
        console.warn(
          `[${platformName}] ❗ Using old stats due to fetch failure`
        );
        return [
          key,
          oldStats[key] || formatError(platformName, value, {}, isUrl),
        ];
      }
    })
  );

  const finalStats = Object.fromEntries(
    statsEntries.map((entry) => entry.value)
  );

  console.log(`✅ Finished fetching all platforms for: ${name} (${rollNo})`);

  return {
    _id,
    name,
    email,
    rollNo,
    year,
    department,
    section,
    stats: finalStats,
  };
}

module.exports = {
  withRetry,
  formatError,
  getStatsForStudent,
};
