const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const mongoose = require("mongoose");
const https = require("https");
const puppeteer = require("puppeteer");

const agent = new https.Agent({ family: 4 });

const User = require("./models/userSchema");
const Student = require("./models/studentSchema");
const dotenv = require("dotenv");
const cron = require("node-cron");
const { get } = require("http");
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

mongoose
  .connect(`${process.env.DB_URI}`)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

async function getStatsForStudent(student) {
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

  const formatError = (platform, identifier, extraFields = {}, isUrl = false) => ({
    platform,
    updatedAt: new Date().toISOString(),
    ...extraFields,
    error: identifier
      ? isUrl
        ? identifier.startsWith("http")
          ? "Failed to fetch"
          : "Invalid URL"
        : "Failed to fetch"
      : isUrl
        ? "URL missing"
        : "Username missing",
  });

  const leetPromise = leetcode ? getLeetCodeStats(leetcode) : Promise.resolve(null);
  const hackPromise = hackerrank ? getHackerRankStats(hackerrank) : Promise.resolve(null);
  const chefPromise = codechef ? getCodeChefStats(codechef) : Promise.resolve(null);
  const cfPromise = codeforces ? getCodeforcesStats(codeforces) : Promise.resolve(null);
  const skillPromise = skillrack && skillrack.startsWith("http")
    ? getSkillrackStats(skillrack)
    : Promise.resolve(null);
  const githubPromise = github ? getGithubStats(github) : Promise.resolve(null); 

  const [leet, hack, chef, cf, skill, githubResult] = await Promise.allSettled([
    leetPromise,
    hackPromise,
    chefPromise,
    cfPromise,
    skillPromise,
    githubPromise,
  ]);

  return {
    _id,
    name,
    email,
    rollNo,
    year,
    department,
    section,
    stats: {
      leetcode: leet.status === "fulfilled" && leet.value
        ? leet.value
        : formatError("LeetCode", leetcode),
      hackerrank: hack.status === "fulfilled" && hack.value
        ? hack.value
        : formatError("HackerRank", hackerrank),
      codechef: chef.status === "fulfilled" && chef.value
        ? chef.value
        : formatError("CodeChef", codechef),
      codeforces: cf.status === "fulfilled" && cf.value
        ? cf.value
        : formatError("Codeforces", codeforces),
      skillrack: skill.status === "fulfilled" && skill.value && typeof skill.value === "object"
        ? skill.value
        : formatError("Skillrack", skillrack, { certificates: [] }, true),
      github: githubResult.status === "fulfilled" && githubResult.value
        ? githubResult.value
        : formatError("GitHub", github),
    },
  };
}

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find({});
    if (!students || students.length === 0) {
      return res.status(200).json({ students: [] });
    }

    const results = students.map((student) => {
      const { stats, ...studentWithoutStats } = student.toObject();
      return { ...studentWithoutStats, stats };
    });

    res.status(200).json({
      students: results,
    });
  } catch (error) {
    console.error("Error fetching students and stats:", error);
    res.status(500).json({ error: "Failed to fetch students and stats" });
  }
});

app.get("/api/students/refetch", async (req, res) => {
  try {
    const { date } = req.query;
    console.log(date);
    const students = await Student.find({});
    if (!students || students.length === 0) {
      return res.status(200).json({ students: [] });
    }

    const updateOperations = students.map((student) => {
      return getStatsForStudent(student)
        .then((updatedStats) => {
          const { stats } = updatedStats;

          const isValidStats =
            (!student.leetcode || stats.leetcode?.solved?.All != null) &&
            (!student.hackerrank ||
              (Array.isArray(stats.hackerrank?.badges) &&
                stats.hackerrank.badges.length > 0)) &&
            (!student.codechef || stats.codechef?.fullySolved != null) &&
            (!student.codeforces || stats.codeforces?.contests != null) &&
            (!student.skillrack ||
              (typeof stats.skillrack === "object" &&
                stats.skillrack.programsSolved != null));

          if (isValidStats) {
            return {
              updateOne: {
                filter: { _id: student._id },
                update: {
                  stats: updatedStats.stats,
                  updatedAt: date,
                },
              },
            };
          } else {
            console.warn(
              `Skipping update for ${student.name} due to invalid stats`
            );
            return null;
          }
        })
        .catch((err) => {
          console.error(`Error fetching stats for ${student.name}:`, err);
          return null;
        });
    });

    const validUpdateOperations = (await Promise.all(updateOperations)).filter(
      Boolean
    );

    if (validUpdateOperations.length > 0) {
      const bulkWriteResult = await Student.bulkWrite(validUpdateOperations);
      console.log("Bulk write result:", bulkWriteResult);
    }

    const updatedStudents = await Student.find({});
    res.status(200).json({ students: updatedStudents });
  } catch (error) {
    console.error("Error refetching student stats:", error);
    res.status(500).json({ error: "Failed to refetch stats for all students" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!name || !email || !rollNo) {
      return res
        .status(400)
        .json({ error: "Name, email, and roll number are required" });
    }

    const studentInfo = {
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
    };

    const statsResult = await getStatsForStudent(studentInfo);

    const newStudent = new Student({
      ...studentInfo,
      stats: statsResult.stats,
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ error: "Failed to add student" });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
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
    } = req.body;

    console.log(`Updating student with ID: ${id}`);

    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    const updatedData = {
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
    };

    const updatedStats = await getStatsForStudent({
      _id: existingStudent._id,
      ...updatedData,
    });

    const stats = updatedStats && updatedStats.stats ? updatedStats.stats : existingStudent.stats;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        ...updatedData,
        stats,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
});

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

async function getHackerRankStats(username) {
  const url = `https://www.hackerrank.com/${username}`;
  try {
    const { data } = await axios.get(
      url,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: `https://www.hackerrank.com/${username}`,
        },
      },
      { httpsAgent: agent }
    );

    const $ = cheerio.load(data);
    const badges = [];

    $(".hacker-badge").each((i, el) => {
      const badgeName = $(el).find(".badge-title").text().trim();
      const stars = $(el).find(".badge-star").length;
      if (badgeName) {
        badges.push({ name: badgeName, stars });
      }
    });

    return {
      platform: "HackerRank",
      username,
      badges: badges.slice(0, 5),
    };
  } catch (error) {
    console.warn(`HackerRank fetch failed for ${username}:`, error.message);
    return null;
  }
}

async function getCodeChefStats(username) {
  const url = `https://www.codechef.com/users/${username}`;
  try {
    const { data } = await axios.get(url);
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
  } catch {
    return { platform: "CodeChef", username, error: "Failed to fetch data" };
  }
}

async function getCodeforcesStats(username) {
  try {
    const userInfoUrl = `https://codeforces.com/api/user.info?handles=${username}`;
    const contestsUrl = `https://codeforces.com/api/user.rating?handle=${username}`;
    const submissionsUrl = `https://codeforces.com/api/user.status?handle=${username}`;

    const [userInfoRes, contestsRes, submissionsRes] = await Promise.all([
      axios.get(userInfoUrl),
      axios.get(contestsUrl),
      axios.get(submissionsUrl),
    ]);

    const user = userInfoRes.data.result[0];
    const contests = contestsRes.data.result.length;
    const submissions = submissionsRes.data.result;

    const solvedSet = new Set();
    submissions.forEach((sub) => {
      if (sub.verdict === "OK") {
        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
        solvedSet.add(problemId);
      }
    });

    return {
      platform: "Codeforces",
      username,
      rating: user.rating || "Unrated",
      rank: user.rank || "Unranked",
      maxRating: user.maxRating || "N/A",
      contests,
      problemsSolved: solvedSet.size,
    };
  } catch (error) {
    console.error("Error fetching Codeforces stats:", error.message);
    return { platform: "Codeforces", username, error: "Failed to fetch data" };
  }
}

async function getSkillrackStats(resumeUrl) {
  if (!resumeUrl || !resumeUrl.startsWith("http")) {
    return {
      platform: "Skillrack",
      error: "Skipped: Invalid or missing URL",
    };
  }
  try {
    const { data } = await axios.get(resumeUrl); 
    const $ = cheerio.load(data);

    let rank = 0;
    let programsSolved = 0;

    $("div.statistic").each((i, el) => {
      const label = $(el).find("div.label").text().trim(); 
      const value = $(el).find("div.value").text().trim();
      if (label.includes("RANK")) rank = parseInt(value);
      if (label.includes("PROGRAMS SOLVED")) programsSolved = parseInt(value);
    });

    const languages = {}; 
    $("div.statistic").each((i, el) => {
      const label = $(el).find("div.label").text().trim().toUpperCase();
      const value = $(el).find("div.value").text().trim();
      if (["JAVA", "C", "SQL", "PYTHON3", "CPP"].includes(label)) {
        languages[label] = parseInt(value);
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
    console.error("Error fetching Skillrack stats:", error.message);
    return {
      platform: "Skillrack",
      error: "Failed to fetch data",
    };
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

// getTryHackMeStats("RedRogue").then(console.log);

async function getGithubStats(username) {
  try {
    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "AlgoLog-App",
    };

    const reposRes = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      { headers }
    );
    const repos = reposRes.data.filter(repo => !repo.fork);
    const totalRepos = repos.length;

    let totalCommits = 0;
    const commitDatesArr = [];
    const languageStats = {};

    for (const repo of repos) {
      const repoName = repo.name;
      let page = 1;
      let hasNextPage = true;
      const now = new Date();
      const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      while (hasNextPage) {
        try {
          const commitRes = await axios.get(
            `https://api.github.com/repos/${username}/${repoName}/commits?page=${page}&per_page=100`,
            { headers }
          );
          const commits = commitRes.data;
          totalCommits += commits.length;
          commits.forEach(commit => {
            const commitDate = commit.commit?.author?.date || commit.committer?.date;
            if (commitDate) {
              const formattedDate = commitDate.split("T")[0];
              if (new Date(formattedDate) >= cutoff) {
                commitDatesArr.push(formattedDate);
              }
            }
          });
          const linkHeader = commitRes.headers.link;
          hasNextPage = linkHeader && linkHeader.includes('rel="next"');
          page++;
        } catch (error) {
          if (error.response?.status === 409) {
            console.warn(`Skipping repo ${repoName} due to no commits (409)`);
            break;
          } else {
            console.error(`Error fetching commits for ${repoName}:`, error.message);
            break;
          }
        }
      }
    }
    const langFetches = repos.map(repo =>
      axios
        .get(`https://api.github.com/repos/${username}/${repo.name}/languages`, { headers })
        .then(res => ({ repo: repo.name, langs: res.data }))
        .catch(() => null)
    );
    const langsResults = await Promise.allSettled(langFetches);
    langsResults.forEach(result => {
      if (result.status === "fulfilled" && result.value) {
        const { langs } = result.value;
        for (const lang of Object.keys(langs)) {
          languageStats[lang] = (languageStats[lang] || 0) + langs[lang];
        }
      }
    });

    const commitDates = Array.from(new Set(commitDatesArr))
      .map(date => new Date(date))
      .sort((a, b) => a - b)
      .map(date => date.toISOString().slice(0, 10));

    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate = null;

    for (const dateStr of commitDates) {
      const currentDate = new Date(dateStr + "T00:00:00Z");
      if (previousDate) {
        const diffDays = (currentDate - previousDate) / (1000 * 3600 * 24);
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      longestStreak = Math.max(longestStreak, currentStreak);
      previousDate = currentDate;
    }

    const topLanguages = Object.entries(languageStats)
      .sort((a, b) => b[1] - a[1])
      .map(([language]) => ({ name: language }));

    return {
      username,
      totalCommits,
      totalRepos,
      longestStreak,
      topLanguages,
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error.message);
    return { error: "Failed to fetch GitHub stats" };
  }
}

getGithubStats("Dharanish-AM").then(console.log);

cron.schedule("0 0 * * *", async () => { 
  console.log("Running cron job to fetch stats...");
  const students = await Student.find();
  for (const student of students) {
    const stats = await getStatsForStudent(student);
    await Student.findByIdAndUpdate(student._id, { stats });
  }
});


// const skillrackUrl =
//   "https://www.skillrack.com/faces/resume.xhtml?id=484181&key=761fea3322a6375533ddd850099a73a57d20956a";
// getSkillrackStats(skillrackUrl).then(console.log);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
