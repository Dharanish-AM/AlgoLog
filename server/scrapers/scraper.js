const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const https = require("https");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from server directory (parent of scrapers)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Bottleneck = require("bottleneck");
const crypto = require("crypto");

// In-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes (increased for rate limit protection)

function getCached(key) {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Global rate limit tracker to prevent API abuse
const rateLimitTracker = {
  codechef: { lastRequest: 0, backoffUntil: 0 },
  codeforces: { lastRequest: 0, backoffUntil: 0 },
};

async function checkRateLimit(platform) {
  const now = Date.now();
  const tracker = rateLimitTracker[platform];
  
  if (tracker && tracker.backoffUntil > now) {
    const waitTime = tracker.backoffUntil - now;
    console.warn(`[${platform}] Global backoff active. Waiting ${Math.ceil(waitTime / 1000)}s...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
}

function setRateLimitBackoff(platform, durationMs) {
  if (rateLimitTracker[platform]) {
    rateLimitTracker[platform].backoffUntil = Date.now() + durationMs;
  }
}

const platformLimits = {
  codechef: { minTime: 2500, maxConcurrent: 2 }, // Slower to avoid 429s
  leetcode: { minTime: 200, maxConcurrent: 8 },  // Increased concurrency
  hackerrank: { minTime: 500, maxConcurrent: 5 }, // Faster with more concurrent
  github: { minTime: 100, maxConcurrent: 15 },    // Maximum throughput
  skillrack: { minTime: 500, maxConcurrent: 4 },  // Faster rate
  codeforces: { minTime: 500, maxConcurrent: 3 }, // Slower for API stability
};

const limiters = Object.fromEntries(
  Object.entries(platformLimits).map(([key, options]) => [
    key,
    new Bottleneck(options),
  ])
);

const {
  codechef: codechefLimiter,
  leetcode: leetcodeLimiter,
  hackerrank: hackerrankLimiter,
  github: githubLimiter,
  skillrack: skillrackLimiter,
  codeforces: codeforcesLimiter,
} = limiters;

const agent = new https.Agent({ 
  family: 4,
  keepAlive: true,
  keepAliveMsecs: 3000, // Longer keepalive
  maxSockets: 100, // More concurrent connections
  maxFreeSockets: 20, // More free sockets
  timeout: 15000, // Faster timeout
  scheduling: 'lifo'
});

async function getLeetCodeQuestionOfToday() {
  const cacheKey = `leetcode:qotd:${new Date().toDateString()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        date
        userStatus
        link
        question {
          acRate
          difficulty
          freqBar
          questionFrontendId
          isFavor
          isPaidOnly
          status
          title
          titleSlug
          hasVideoSolution
          hasSolution
          topicTags {
            name
            id
            slug
          }
        }
      }
    }
  `;
  try {
    const res = await axios.post(
      "https://leetcode.com/graphql/",
      { query },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
        },
        httpsAgent: agent,
        timeout: 8000,
        decompress: true,
      }
    );

    const daily = res.data.data.activeDailyCodingChallengeQuestion;
    let statusText = "🔴 Not Started";

    if (daily.userStatus === "Finished") statusText = "✅ Solved";
    else if (daily.userStatus === "Started") statusText = "🟡 In Progress";

    const result = {
      ...daily,
      statusText,
      fullLink: `https://leetcode.com${daily.link}`,
    };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error(
      "Error fetching LeetCode question of today:",
      error.response?.data || error.message
    );
    return null;
  }
}

// getLeetCodeQuestionOfToday().then((e) => console.log(e));

async function getLeetCodeStats(username) {
  const cacheKey = `leetcode:stats:${username}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const query = `
    query userContestRankingInfo($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
        tagProblemCounts {
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
        }
        badges {
          id
          name
          shortName
          displayName
          icon
          category
          creationDate
        }
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
        badge {
          name
        }
      }
      userContestRankingHistory(username: $username) {
        attended
        trendDirection
        problemsSolved
        totalProblems
        finishTimeInSeconds
        rating
        ranking
        contest {
          title
          startTime
        }
      }
      languageStats: matchedUser(username: $username) {
        languageProblemCount {
          languageName
          problemsSolved
        }
      }
      skillStats: matchedUser(username: $username) {
        tagProblemCounts {
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
        }
      }
      userProfileCalendar: matchedUser(username: $username) {
        userCalendar(year: ${new Date().getFullYear()}) {
          activeYears
          streak
          totalActiveDays
          submissionCalendar
        }
      }
    }
  `;

  try {
    const res = await axios.post(
      "https://leetcode.com/graphql/",
      {
        query,
        variables: { username },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
        },
        httpsAgent: agent,
        timeout: 10000,
        decompress: true,
      }
    );

    const userData = res.data.data;
    const stats = userData.matchedUser?.submitStats?.acSubmissionNum || [];
    // Extract new fields
    const languageStats = userData.languageStats?.languageProblemCount || [];
    const skillStats = userData.skillStats?.tagProblemCounts || {};
    const calendar = userData.userProfileCalendar?.userCalendar || {};
    // Merge tag data from fundamental, intermediate, advanced
    const allTags = [
      ...(skillStats.fundamental || []),
      ...(skillStats.intermediate || []),
      ...(skillStats.advanced || []),
    ];
    const tagMap = new Map();
    for (const tag of allTags) {
      if (!tagMap.has(tag.tagName)) {
        tagMap.set(tag.tagName, tag.problemsSolved);
      } else {
        tagMap.set(tag.tagName, tagMap.get(tag.tagName) + tag.problemsSolved);
      }
    }
    const mergedTopicStats = Array.from(
      tagMap,
      ([tagName, problemsSolved]) => ({
        tagName,
        problemsSolved,
      })
    );
    const contestInfo = userData.userContestRanking;
    const contestHistory = userData.userContestRankingHistory || [];

    const allBadges = userData.matchedUser?.badges || [];
    const processedBadges = allBadges.map((b) => ({
      id: b.id,
      name: b.name,
      shortName: b.shortName,
      displayName: b.displayName,
      icon: b.icon,
      category: b.category,
      creationDate: b.creationDate,
    }));

    const result = {
      platform: "LeetCode",
      username,
      solved: {
        All: stats.find((i) => i.difficulty === "All")?.count || 0,
        Easy: stats.find((i) => i.difficulty === "Easy")?.count || 0,
        Medium: stats.find((i) => i.difficulty === "Medium")?.count || 0,
        Hard: stats.find((i) => i.difficulty === "Hard")?.count || 0,
      },
      topicStats: mergedTopicStats,
      rating: isNaN(contestInfo?.rating) ? 0 : contestInfo.rating,
      globalRanking: isNaN(contestInfo?.globalRanking)
        ? 0
        : contestInfo.globalRanking,
      contestCount: isNaN(contestInfo?.attendedContestsCount)
        ? 0
        : contestInfo.attendedContestsCount,
      topPercentage: isNaN(contestInfo?.topPercentage)
        ? 0
        : contestInfo.topPercentage,
      contests: contestHistory
        .filter((contest) => contest.attended)
        .map((contest) => ({
          title: contest.contest.title,
          startTime: contest.contest.startTime,
          rating: contest.rating,
          ranking: contest.ranking,
          problemsSolved: contest.problemsSolved,
          totalProblems: contest.totalProblems,
          trendDirection: contest.trendDirection,
          finishTimeInSeconds: contest.finishTimeInSeconds,
        })),
      badges: processedBadges,
      languageStats,
      streak: calendar.streak || 0,
      totalActiveDays: calendar.totalActiveDays || 0,
      activeYears: calendar.activeYears || [],
      // submissionCalendar: calendar.submissionCalendar || "",
    };
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    const errorMsg = error.response?.status === 404 
      ? "User not found" 
      : error.code === 'ECONNABORTED' || error.message.includes('timeout')
      ? "Request timeout"
      : "Failed to fetch data";
    console.error(`[LeetCode] Error for ${username}:`, error.message);
    return { platform: "LeetCode", username, error: errorMsg };
  }
}

// getLeetCodeStats("sabarimcse6369").then((e) => console.log(e));

async function getHackerRankStats(username) {
  const cacheKey = `hackerrank:stats:${username}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `https://www.hackerrank.com/${username}`;
  const maxAttempts = 2;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Referer: url,
        },
        httpsAgent: agent,
        timeout: 8000,
        decompress: true,
      });

      const $ = cheerio.load(data);
      const badges = $(".hacker-badge")
        .toArray()
        .slice(0, 5)
        .map((el) => {
          const badgeName = $(el).find(".badge-title").text().trim();
          const stars = $(el).find(".badge-star").length;
          return { name: badgeName || "", stars };
        });

      const result = {
        platform: "HackerRank",
        username,
        badges: badges.length > 0 ? badges : [],
      };
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.warn(
        `Attempt ${attempt} failed to fetch HackerRank data for ${username}:`,
        error.message
      );
      if (attempt < maxAttempts) await delay(500 * attempt);
      else {
        return {
          platform: "HackerRank",
          username,
          error: "Failed to fetch data after multiple attempts",
        };
      }
    }
  }
}

async function getCodeChefStats(username) {
  const cacheKey = `codechef:stats:${username}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Check global rate limit
  await checkRateLimit('codechef');

  const url = `https://www.codechef.com/users/${username}`;
  const maxAttempts = 3; // Increased attempts
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          Referer: url,
        },
        httpsAgent: agent,
        timeout: 8000,
        decompress: true,
      });

      if (
        data.includes(
          "The username specified does not exist in our database."
        ) ||
        data.includes("404 Page Not Found") ||
        data.includes("not found") ||
        data.trim().length < 1000
      ) {
        console.warn(`User ${username} not found or invalid CodeChef page.`);
        return {
          platform: "CodeChef",
          username,
          rating: null,
          fullySolved: null,
        };
      }

      const $ = cheerio.load(data);

      let rating = $("div.rating-number")
        .contents()
        .filter(function () {
          return this.type === "text";
        })
        .text()
        .trim()
        .replace("?", "");

      const solvedText = $("h3")
        .filter((i, el) => $(el).text().includes("Total Problems Solved"))
        .text()
        .match(/\d+/);
      const fullySolved = solvedText ? parseInt(solvedText[0], 10) : 0;

      if (!rating && fullySolved === 0) {
        throw new Error("Invalid or empty CodeChef profile page");
      }

      console.info(
        `[CodeChef] ✅ Success for ${username} on attempt ${attempt}`
      );

      const result = {
        platform: "CodeChef",
        username,
        rating,
        fullySolved,
      };
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      const isEmptyProfile =
        error.message &&
        error.message.includes("Invalid or empty CodeChef profile page");

      const isNotFound = error.response && error.response.status === 404;

      if (isEmptyProfile || isNotFound) {
        console.warn(
          `Skipped CodeChef fetch for ${username}: ${error.message}`
        );
        const result = {
          platform: "CodeChef",
          username,
          rating: null,
          fullySolved: null,
        };
        setCache(cacheKey, result);
        return result;
      }

      console.warn(
        `Attempt ${attempt} failed to fetch CodeChef data for ${username}:`,
        error.message
      );

      if (attempt < maxAttempts) {
        // Exponential backoff for rate limiting (429 errors)
        if (error.response?.status === 429) {
          const waitTime = Math.min(8000 * Math.pow(2, attempt - 1), 30000); // 8s, 16s, 30s max
          console.warn(`⏳ CodeChef rate limited. Waiting ${waitTime / 1000}s before retry...`);
          setRateLimitBackoff('codechef', waitTime); // Set global backoff
          await delay(waitTime);
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          await delay(2000 * attempt); // Timeout - progressive delay
        } else {
          await delay(1500 * attempt); // Other errors
        }
      } else {
        return {
          platform: "CodeChef",
          username,
          error: "Failed to fetch data after multiple attempts",
        };
      }
    }
  }
}

const CF_KEY = "bc101866ff73f1c52d47a140da274741148a91cd";
const CF_SECRET = "82a89e594a95dc4d4ce2d20954cace11de5e990a";

function generateCFSignature(method, params) {
  const rand = Math.random().toString(36).slice(2, 8);
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const base = `${rand}/${method}?${sorted}#${CF_SECRET}`;
  const hash = crypto.createHash("sha512").update(base).digest("hex");

  return { apiSig: `${rand}${hash}` };
}

async function callCF(method, params) {
  params.apiKey = CF_KEY;
  params.time = Math.floor(Date.now() / 1000);

  const { apiSig } = generateCFSignature(method, params);

  const url = `https://codeforces.com/api/${method}?${new URLSearchParams({
    ...params,
    apiSig,
  }).toString()}`;

  const res = await axios.get(url, {
    timeout: 10000,
    httpsAgent: agent,
    headers: {
      "Accept-Encoding": "gzip, deflate, br",
    },
  });
  if (res.data.status !== "OK") throw new Error(res.data.comment);
  return res.data.result;
}

async function getCodeforcesStats(username) {
  const cacheKey = `codeforces:stats:${username}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Check global rate limit
  await checkRateLimit('codeforces');

  const maxAttempts = 2;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Fetch info and rating in parallel, submissions separately with limit
      const [info, ratingData] = await Promise.all([
        callCF("user.info", { handles: username }),
        callCF("user.rating", { handle: username }).catch(() => [])
      ]);
      
      // Fetch only recent 500 submissions for faster response (reduced from 1000)
      const submissions = await callCF("user.status", { handle: username, from: 1, count: 500 }).catch(() => []);

    const user = info[0];
    const contests = ratingData.length;

    const solved = new Set();
    submissions.forEach((s) => {
      if (s.verdict === "OK" && s.problem) {
        solved.add(`${s.problem.contestId}-${s.problem.index}`);
      }
    });

      const result = {
        platform: "Codeforces",
        username,
        rating: user.rating || "Unrated",
        maxRating: user.maxRating || "N/A",
        rank: user.rank || "Unranked",
        maxRank: user.maxRank || "N/A",
        contests,
        problemsSolved: solved.size,
      };
      setCache(cacheKey, result);
      console.info(`[Codeforces] ✅ Success for ${username} on attempt ${attempt}`);
      return result;
    } catch (err) {
      console.warn(`[Codeforces] Attempt ${attempt}/${maxAttempts} failed for ${username}: ${err.message}`);
      
      if (attempt < maxAttempts) {
        const waitTime = 2000 * attempt; // 2s, 4s progressive delay
        console.warn(`⏳ Codeforces waiting ${waitTime / 1000}s before retry...`);
        
        // Set backoff for rate limit or API errors
        if (err.response?.status === 429 || err.message.includes('limit')) {
          setRateLimitBackoff('codeforces', waitTime);
        }
        
        await delay(waitTime);
      } else {
        return {
          platform: "Codeforces",
          username,
          error: err.message.includes('User with handle') ? 'User not found' : err.message,
        };
      }
    }
  }
}

// getCodeforcesStats("tourist").then(console.log);

async function getSkillrackStats(resumeUrl) {
  if (!resumeUrl || !resumeUrl.startsWith("http")) {
    return {
      platform: "Skillrack",
      error: "Skipped: Invalid or missing URL",
    };
  }
  const cacheKey = `skillrack:stats:${resumeUrl}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const maxAttempts = 2;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(resumeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
        },
        timeout: 6000,
        decompress: true,
        httpsAgent: agent,
      });
      const $ = cheerio.load(data);

      let rank = 0;
      let programsSolved = 0;
      const languages = {};
      $("div.statistic").each((i, el) => {
        const label = $(el).find("div.label").text().trim().toUpperCase();
        const value = parseInt($(el).find("div.value").text().trim(), 10);
        if (label.includes("RANK")) rank = value;
        else if (label.includes("PROGRAMS SOLVED")) programsSolved = value;
        else if (["JAVA", "C", "SQL", "PYTHON3", "CPP"].includes(label)) {
          languages[label] = value;
        }
      });

      const certificates = [];
      $("div.ui.brown.card").each((i, el) => {
        const content = $(el).find("div.content");

        const title = content.find("b").text().trim();
        const dateMatch = content
          .text()
          .match(/\d{2}-\d{2}-\d{4}( \d{2}:\d{2})?/);
        const date = dateMatch ? dateMatch[0] : "";
        const link = content.find("a").attr("href");

        if (title && link) {
          certificates.push({ title, date, link });
        }
      });

      if (rank === 0 && programsSolved === 0 && certificates.length === 0) {
        throw new Error("Invalid Skillrack URL");
      }

      const result = {
        platform: "Skillrack",
        rank,
        programsSolved,
        languages,
        certificates,
      };
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(
        `Attempt ${attempt} failed to fetch Skillrack stats:`,
        error.message
      );
      if (attempt < maxAttempts) await delay(500 * attempt);
      else {
        return {
          platform: "Skillrack",
          error: "Failed to fetch data",
        };
      }
    }
  }
}

async function getTryHackMeStats(username) {
  const url = `https://tryhackme.com/p/${username}`;
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  const stats = await page.evaluate(() => {
    const getText = (label) => {
      const statBox = Array.from(document.querySelectorAll("div")).find(
        (div) => div.textContent.trim() === label
      )?.parentElement;
      return statBox?.querySelector("span")?.textContent?.trim();
    };

    const topPercentageEl = document.querySelector("div.sc-fSnEDd");
    const topPercentage = topPercentageEl?.textContent?.trim();

    return {
      platform: "TryHackMe",
      username: window.location.pathname.split("/").pop(),
      rank: parseInt(getText("Rank")),
      topPercentage: topPercentage?.includes("top") ? topPercentage : null,
      badges: parseInt(getText("Badges")),
      completedRooms: parseInt(getText("Completed rooms")),
    };
  });

  await browser.close();
  return stats;
}

async function getGithubStats(username) {
  const cacheKey = `github:stats:${username}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const maxAttempts = 3;
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  // 6. GitHub retry with exponential backoff
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        throw new Error("GitHub token not found");
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "AlgoLog-App",
      };

      const query = `
  query {
    user(login: "${username}") {
      repositories(first: 50, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
        totalCount
        nodes {
          name
          languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node { 
                name
              }
            }
          }
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

      const res = await axios.post(
        "https://api.github.com/graphql",
        { query },
        { 
          headers: {
            ...headers,
            "Accept-Encoding": "gzip, deflate, br",
          }, 
          timeout: 8000,
          decompress: true,
        }
      );

      // 6. Better null checking
      if (!res.data || !res.data.data || !res.data.data.user) {
        throw new Error(`GitHub user not found or invalid response: ${username}`);
      }

      const user = res.data.data.user;

      // Safe access with null checks
      const totalRepos = user.repositories?.totalCount || 0;
      const totalCommits =
        user.contributionsCollection?.contributionCalendar?.totalContributions || 0;

      const languageBytes = {};

      if (user.repositories?.nodes) {
        user.repositories.nodes.forEach((repo) => {
          if (repo && repo.languages && repo.languages.edges) {
            repo.languages.edges.forEach(({ node, size }) => {
              if (node && node.name) {
                languageBytes[node.name] = (languageBytes[node.name] || 0) + size;
              }
            });
          }
        });
      }

      const topLanguages = Object.entries(languageBytes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => ({ name }));

      const result = {
        platform: "GitHub",
        username,
        totalCommits,
        totalRepos,
        longestStreak: 0,
        topLanguages,
      };
      
      setCache(cacheKey, result);
      console.log(`[GitHub] ✅ Success for ${username} on attempt ${attempt}`);
      return result;
    } catch (error) {
      const isRateLimited = error.response?.status === 403 || error.response?.status === 429;
      const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
      
      console.error(
        `[GitHub] Attempt ${attempt}/${maxAttempts} failed for ${username}: ${error.message}`
      );

      if (attempt < maxAttempts) {
        // 6. Exponential backoff: 2s, 4s, 8s
        const waitTime = isRateLimited ? 5000 * Math.pow(2, attempt - 1) : 2000 * attempt;
        console.warn(`⏳ Waiting ${waitTime / 1000}s before retry...`);
        await delay(waitTime);
      } else {
        return {
          platform: "GitHub",
          username,
          error: `Failed to fetch data after ${maxAttempts} attempts: ${error.message}`,
          totalCommits: 0,
          totalRepos: 0,
          topLanguages: [],
        };
      }
    }
  }
}

const limitedGetCodeChefStats = codechefLimiter.wrap(getCodeChefStats);

const limitedGetLeetCodeStats = leetcodeLimiter.wrap(getLeetCodeStats);
const limitedGetHackerRankStats = hackerrankLimiter.wrap(getHackerRankStats);
const limitedGetGithubStats = githubLimiter.wrap(getGithubStats);
const limitedGetSkillrackStats = skillrackLimiter.wrap(getSkillrackStats);
const limitedGetCodeforcesStats = codeforcesLimiter.wrap(getCodeforcesStats);

module.exports = {
  getLeetCodeStats: limitedGetLeetCodeStats,
  getHackerRankStats: limitedGetHackerRankStats,
  getGithubStats: limitedGetGithubStats,
  getCodeChefStats: limitedGetCodeChefStats,
  getSkillrackStats: limitedGetSkillrackStats,
  getCodeforcesStats: limitedGetCodeforcesStats,
  getTryHackMeStats,
  getLeetCodeQuestionOfToday,
};
