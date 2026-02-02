const {
  getCodeChefStats,
  getHackerRankStats,
  getLeetCodeStats,
  getGithubStats,
  getSkillrackStats,
  getCodeforcesStats,
} = require("../config/scraper");

// Default shapes for stats; keeps numbers at 0 when a profile is valid
// and allows us to swap to "N/A" for missing/error scenarios without
// leaving holes in the payload.
const STAT_DEFAULTS = {
  leetcode: {
    platform: "LeetCode",
    username: "",
    solved: { All: 0, Easy: 0, Medium: 0, Hard: 0 },
    rating: 0,
    globalRanking: 0,
    contestCount: 0,
    topPercentage: 0,
    badges: [],
    contests: [],
    topicStats: [],
    languageStats: [],
    streak: 0,
    totalActiveDays: 0,
    activeYears: [],
  },
  hackerrank: {
    platform: "HackerRank",
    username: "",
    badges: [],
  },
  codechef: {
    platform: "CodeChef",
    username: "",
    rating: 0,
    highestRating: 0,
    globalRank: 0,
    countryRank: 0,
    fullySolved: 0,
    updatedAt: null,
    division: "N/A",
    stars: "1★",
  },
  codeforces: {
    platform: "Codeforces",
    username: "",
    rating: 0,
    maxRating: 0,
    rank: "",
    maxRank: "",
    contests: 0,
    problemsSolved: 0,
  },
  skillrack: {
    platform: "Skillrack",
    username: "",
    rank: 0,
    programsSolved: 0,
    languages: {
      JAVA: 0,
      C: 0,
      SQL: 0,
      PYTHON3: 0,
      CPP: 0,
    },
    certificates: [],
  },
  github: {
    platform: "GitHub",
    username: "",
    totalCommits: 0,
    currentYearContributions: 0,
    lifetimeContributions: 0,
    totalRepos: 0,
    longestStreak: 0,
    currentStreak: 0,
    topLanguages: [],
  },
};

const NA_VALUE = "N/A";

const STAT_NA = Object.fromEntries(
  Object.entries(STAT_DEFAULTS).map(([key, template]) => [
    key,
    transformWithNA(template),
  ]),
);

function transformWithNA(template) {
  if (Array.isArray(template)) return [];
  if (template && typeof template === "object") {
    return Object.fromEntries(
      Object.entries(template).map(([k, v]) => [k, transformWithNA(v)]),
    );
  }
  if (typeof template === "number") return NA_VALUE;
  return NA_VALUE;
}

function mergeDefaults(template, value) {
  if (Array.isArray(template)) {
    return Array.isArray(value) ? value : [];
  }
  if (template && typeof template === "object") {
    const merged = {};
    const source = value && typeof value === "object" ? value : {};
    for (const [k, v] of Object.entries(template)) {
      merged[k] = mergeDefaults(v, source[k]);
    }
    // Preserve any extra fields from the source (e.g., badges data)
    for (const [k, v] of Object.entries(source)) {
      if (merged[k] === undefined) merged[k] = v;
    }
    return merged;
  }
  if (typeof template === "number") {
    const numeric = Number.isFinite(value) ? value : 0;
    return numeric;
  }
  return value ?? template;
}

function normalizePlatformStats(key, raw, identifier) {
  const defaults = STAT_DEFAULTS[key];
  if (!defaults) return raw;

  // Profile not found or fetch error → fill with N/A placeholders
  if (!raw || raw.error) {
    const naShape = STAT_NA[key];
    return {
      ...naShape,
      platform: defaults.platform,
      username: raw?.username || identifier || "",
      error: raw?.error || "Profile not found or unavailable",
    };
  }

  // Profile found → ensure all numeric fields are present and defaulted to 0
  const merged = mergeDefaults(defaults, raw);
  merged.platform = defaults.platform;
  if (!merged.username && identifier) merged.username = identifier;
  return merged;
}

async function withRetry(
  promiseFn,
  retries = 1, // Reduced default retries
  platform = "Unknown",
  identifier = "N/A",
) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await promiseFn();

      // Check if result contains an error (failed fetch that returned error object)
      if (result && result.error) {
        console.warn(
          `[${platform}] ❌ Failed for ${identifier}: ${result.error}`,
        );
      } else {
        if (attempt > 1) {
          console.info(
            `[${platform}] ✅ Success for ${identifier} on attempt ${attempt}`,
          );
        }
      }
      return result;
    } catch (err) {
      console.warn(
        `[${platform}] ❌ Attempt ${attempt} failed for ${identifier}: ${err.message}`,
      );
      if (attempt > retries) throw err;
      // Faster retry delay
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
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
          `[${platformName}] ⚠️ Skipping due to invalid or missing identifier.`,
        );
        return [
          key,
          normalizePlatformStats(
            key,
            { error: "Invalid or missing identifier", username: value },
            value,
          ),
        ];
      }

      try {
        const result = await withRetry(
          () => fetchFn(value),
          1, // Single retry only
          platformName,
          value,
        );

        return [key, normalizePlatformStats(key, result, value)];
      } catch (err) {
        console.warn(
          `[${platformName}] ❗ Fetch failed, returning N/A defaults: ${err.message}`,
        );
        return [
          key,
          normalizePlatformStats(
            key,
            { error: err.message, username: value },
            value,
          ),
        ];
      }
    }),
  );

  const finalStats = Object.fromEntries(
    statsEntries.map((entry) => entry.value),
  );

  console.log(`✅ Completed fetch for: ${name} (${rollNo})`);

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
  getStatsForStudent,
};
