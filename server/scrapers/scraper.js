const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const https = require("https");
const dotenv = require("dotenv");
dotenv.config();
const Bottleneck = require("bottleneck");

const codechefLimiter = new Bottleneck({
  minTime: 7000, // one request every 7 seconds
  maxConcurrent: 1,
});

const agent = new https.Agent({ family: 4 });

async function getLeetCodeStats(username) {
  const query = `
    {
      matchedUser(username: "${username}") {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;
  try {
    const res = await axios.post("https://leetcode.com/graphql", { query });
    const stats = res.data.data.matchedUser.submitStats.acSubmissionNum;
    return {
      platform: "LeetCode",
      username,
      solved: {
        All: stats.find((i) => i.difficulty === "All").count,
        Easy: stats.find((i) => i.difficulty === "Easy").count,
        Medium: stats.find((i) => i.difficulty === "Medium").count,
        Hard: stats.find((i) => i.difficulty === "Hard").count,
      },
      rating: res.data.data.matchedUser.userContestRanking?.rating || "N/A",
    };
  } catch {
    return { platform: "LeetCode", username, error: "Failed to fetch data" };
  }
}

// getLeetCodeStats("geethapriyans").then(console.log);

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

//getHackerRankStats("ranajay_s2021").then(console.log);

async function getCodeChefStats(username) {
  const url = `https://www.codechef.com/users/${username}`;
  const maxAttempts = 10;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
          "Accept-Language": "en-US,en;q=0.9",
          Connection: "keep-alive",
          Referer: url,
        },
        httpsAgent: agent,
        timeout: 15000,
      });

      const $ = cheerio.load(data);

      const rating = $("div.rating-number")
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

      return {
        platform: "CodeChef",
        username,
        rating,
        fullySolved,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn(
          `User ${username} not found on CodeChef. Returning empty stats.`
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
        await delay(10000 * attempt);
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

// getCodeChefStats("iam_elango").then(console.log);

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

// getCodeforcesStats("guruvishal_30").then(console.log);

async function getSkillrackStats(resumeUrl) {
  if (!resumeUrl || !resumeUrl.startsWith("http")) {
    return {
      platform: "Skillrack",
      error: "Skipped: Invalid or missing URL",
    };
  }
  const maxAttempts = 10;
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

//getTryHackMeStats("ben0309").then(console.log);

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

// getGithubStats("").then(console.log);

const limitedGetCodeChefStats = codechefLimiter.wrap(getCodeChefStats);

module.exports = {
  getHackerRankStats,
  getLeetCodeStats,
  getTryHackMeStats,
  getGithubStats,
  getSkillrackStats,
  getCodeforcesStats,
  getCodeChefStats: limitedGetCodeChefStats,
};
