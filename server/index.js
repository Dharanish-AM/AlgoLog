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
const cron = require('node-cron');
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
  } = student;

  const leetPromise = leetcode
    ? getLeetCodeStats(leetcode)
    : Promise.resolve(null);
  const hackPromise = hackerrank
    ? getHackerRankStats(hackerrank)
    : Promise.resolve(null);
  const chefPromise = codechef
    ? getCodeChefStats(codechef)
    : Promise.resolve(null);
  const cfPromise = codeforces
    ? getCodeforcesStats(codeforces)
    : Promise.resolve(null);
  const skillPromise =
    skillrack && skillrack.startsWith("http")
      ? getSkillrackStats(skillrack)
      : Promise.resolve(null);

  const [leet, hack, chef, cf, skill] = await Promise.allSettled([
    leetPromise,
    hackPromise,
    chefPromise,
    cfPromise,
    skillPromise,
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
      leetcode:
        leet.status === "fulfilled" && leet.value
          ? leet.value
          : {
              platform: "LeetCode",
              error: leetcode ? "Failed to fetch" : "Username missing",
            },
      hackerrank:
        hack.status === "fulfilled" && hack.value
          ? hack.value
          : {
              platform: "HackerRank",
              error: hackerrank ? "Failed to fetch" : "Username missing",
            },
      codechef:
        chef.status === "fulfilled" && chef.value
          ? chef.value
          : {
              platform: "CodeChef",
              error: codechef ? "Failed to fetch" : "Username missing",
            },
      codeforces:
        cf.status === "fulfilled" && cf.value
          ? cf.value
          : {
              platform: "Codeforces",
              error: codeforces ? "Failed to fetch" : "Username missing",
            },
      skillrack:
        skill.status === "fulfilled" &&
        skill.value &&
        typeof skill.value === "object"
          ? skill.value
          : {
              platform: "Skillrack",
              certificates: [],
              error: skillrack
                ? skillrack.startsWith("http")
                  ? "Failed to fetch"
                  : "Invalid URL"
                : "URL missing",
            },
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
    console.log(date)
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
                  updatedAt: date 
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
    } = req.body;

    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    const platformChanged =
      existingStudent.leetcode !== leetcode ||
      existingStudent.hackerrank !== hackerrank ||
      existingStudent.codechef !== codechef ||
      existingStudent.codeforces !== codeforces ||
      existingStudent.skillrack !== skillRack;

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
    };

    let stats = existingStudent.stats;

    if (platformChanged) {
      const updatedStats = await getStatsForStudent({
        ...updatedData,
      });
      stats = updatedStats.stats;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        ...updatedData,
        stats,
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

    const [userInfoRes, contestsRes] = await Promise.all([
      axios.get(userInfoUrl),
      axios.get(contestsUrl),
    ]);

    const user = userInfoRes.data.result[0];
    const contests = contestsRes.data.result.length;

    return {
      platform: "Codeforces",
      username,
      rating: user.rating || "Unrated",
      rank: user.rank || "Unranked",
      maxRating: user.maxRating || "N/A",
      contests,
    };
  } catch {
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

cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job to fetch stats...");
  const students = await Student.find();
  for (const student of students) {
    const stats = await getStatsForStudent(student);
    await Student.findByIdAndUpdate(student._id, { stats });
  }
});

// getTryHackMeStats("RedRogue").then(console.log);

// const skillrackUrl =
//   "https://www.skillrack.com/faces/resume.xhtml?id=484181&key=761fea3322a6375533ddd850099a73a57d20956a";
// getSkillrackStats(skillrackUrl).then(console.log);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
