const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const https = require("https");
const dotenv = require("dotenv");
dotenv.config();
const Bottleneck = require("bottleneck");

const platformLimits = {
  codechef: { minTime: 7000, maxConcurrent: 1 },
  leetcode: { minTime: 2000 },
  hackerrank: { minTime: 3000 },
  github: { minTime: 1000 },
  skillrack: { minTime: 3000 },
  codeforces: { minTime: 2000 },
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

const agent = new https.Agent({ family: 4 });

async function getLeetCodeQuestionOfToday() {
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
        },
        httpsAgent: agent,
      }
    );

    const daily = res.data.data.activeDailyCodingChallengeQuestion;
    let statusText = "🔴 Not Started";

    if (daily.userStatus === "Finished") statusText = "✅ Solved";
    else if (daily.userStatus === "Started") statusText = "🟡 In Progress";

    return {
      ...daily,
      statusText,
      fullLink: `https://leetcode.com${daily.link}`,
    };
  } catch (error) {
    console.error(
      "Error fetching LeetCode question of today:",
      error.response?.data || error.message
    );
    return null;
  }
}

getLeetCodeQuestionOfToday().then((e) => console.log(e));

async function getLeetCodeStats(username) {
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
          hoverText
          medal {
            slug
            config {
              iconGif
              iconGifBackground
            }
          }
          creationDate
          category
        }
        upcomingBadges {
          name
          icon
          progress
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
        },
        httpsAgent: agent,
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
      hoverText: b.hoverText,
      category: b.category,
      creationDate: b.creationDate,
    }));

    return {
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
  } catch (error) {
    console.error("LeetCode fetch error:", error.message);
    return { platform: "LeetCode", username, error: "Failed to fetch data" };
  }
}

// getLeetCodeStats("sabarimcse6369").then((e) => console.log(e));

async function getHackerRankStats(username) {
  const url = `https://www.hackerrank.com/${username}`;
  const maxAttempts = 5;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: url,
        },
        httpsAgent: agent,
        timeout: 20000,
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

      if (badges.length === 0) {
        return {
          platform: "HackerRank",
          username,
          badges: [],
        };
      }

      return {
        platform: "HackerRank",
        username,
        badges,
      };
    } catch (error) {
      console.warn(
        `Attempt ${attempt} failed to fetch HackerRank data for ${username}:`,
        error.message
      );
      if (attempt < maxAttempts) await delay(2000 * attempt);
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
  const url = `https://www.codechef.com/users/${username}`;
  const maxAttempts = 5;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
          "Accept-Language": "en-US,en;q=0.9",
          Connection: "keep-alive",
          Referer: url,
        },
        httpsAgent: agent,
        timeout: 15000,
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

      return {
        platform: "CodeChef",
        username,
        rating,
        fullySolved,
      };
    } catch (error) {
      const isEmptyProfile =
        error.message &&
        error.message.includes("Invalid or empty CodeChef profile page");

      const isNotFound = error.response && error.response.status === 404;

      if (isEmptyProfile || isNotFound) {
        console.warn(
          `Skipped CodeChef fetch for ${username}: ${error.message}`
        );
        return {
          platform: "CodeChef",
          username,
          rating: null,
          fullySolved: null,
        };
      }

      console.warn(
        `Attempt ${attempt} failed to fetch CodeChef data for ${username}:`,
        error.message
      );

      if (attempt < maxAttempts) {
        await delay(3000 * attempt);
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

async function getCodeforcesStats(username) {
  const profileUrl = `https://codeforces.com/profile/${username}`;
  const contestsUrl = `https://codeforces.com/contests/with/${username}`;
  const maxAttempts = 5;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const [profileRes, contestsRes] = await Promise.all([
        axios.get(profileUrl, { headers: { "User-Agent": "Mozilla/5.0" } }),
        axios.get(contestsUrl, { headers: { "User-Agent": "Mozilla/5.0" } }),
      ]);

      if (
        profileRes.data.includes(
          `Codeforces.showMessage("Can't find such user"`
        ) ||
        profileRes.data.includes(`showMessage("Can't find such user"`)
      ) {
        console.warn(`User ${username} not found on Codeforces.`);
        return {
          platform: "Codeforces",
          username,
          rating: null,
          rank: null,
          maxRating: null,
          contests: 0,
          problemsSolved: 0,
        };
      }

      const $ = cheerio.load(profileRes.data);

      const rating =
        $('span[style="font-weight:bold;"].user-gray').first().text().trim() ||
        "Unrated";
      const rank = $("div.user-rank > span").text().trim() || "Unranked";
      const maxRank =
        $("span.smaller")
          .text()
          .match(/max\. (.*),/i)?.[1]
          ?.trim() || "N/A";
      const maxRating =
        $("span.smaller")
          .text()
          .match(/,\s*(\d+)/)?.[1] || "N/A";

      const problemsSolved = parseInt(
        $("._UserActivityFrame_counterValue")
          .filter((i, el) => $(el).text().includes("problems"))
          .text()
          .match(/\d+/)?.[0] || "0"
      );

      const $$ = cheerio.load(contestsRes.data);
      const contests = $$(".user-contests-table tbody tr").length;

      return {
        platform: "Codeforces",
        username,
        rating,
        rank,
        maxRating,
        contests,
        problemsSolved,
      };
    } catch (error) {
      console.error(
        `Attempt ${attempt} failed to fetch Codeforces data for ${username}:`,
        error.message
      );
      if (attempt < maxAttempts) {
        await delay(2000 * attempt);
      } else {
        return {
          platform: "Codeforces",
          username,
          error: "Failed to fetch data after multiple attempts",
        };
      }
    }
  }
}

async function getSkillrackStats(resumeUrl) {
  if (!resumeUrl || !resumeUrl.startsWith("http")) {
    return {
      platform: "Skillrack",
      error: "Skipped: Invalid or missing URL",
    };
  }
  const maxAttempts = 5;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(resumeUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 5000,
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
        throw new Error("Inavalid Skillrack URL");
      }

      return {
        platform: "Skillrack",
        rank,
        programsSolved,
        languages,
        certificates,
      };
    } catch (error) {
      console.error(
        `Attempt ${attempt} failed to fetch Skillrack stats:`,
        error.message
      );
      if (attempt < maxAttempts) await delay(1000 * attempt);
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
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
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
      { headers }
    );

    const user = res.data.data.user;

    const totalRepos = user.repositories.totalCount;
    const totalCommits =
      user.contributionsCollection.contributionCalendar.totalContributions;

    const languageBytes = {};

    user.repositories.nodes.forEach((repo) => {
      repo.languages.edges.forEach(({ node, size }) => {
        languageBytes[node.name] = (languageBytes[node.name] || 0) + size;
      });
    });

    const topLanguages = Object.entries(languageBytes)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => ({ name }));

    return {
      username,
      totalCommits,
      totalRepos,
      longestStreak: 0,
      topLanguages,
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error.message);
    return { error: "Failed to fetch GitHub stats" };
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
