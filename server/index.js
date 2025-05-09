const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./models/userSchema");
const Student = require("./models/studentSchema");
const dotenv = require("dotenv");
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

app.get("/", (req, res) => {
  res.send("CodeTrackr API is running...");
});

app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find({});

    if (!students || students.length === 0) {
      return res.status(200).json({ students: [] });
    }

    const results = await Promise.all(
      students.map(async (student) => {
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
        } = student;

        const [leet, hack, chef, cf] = await Promise.all([
          getLeetCodeStats(leetcode),
          getHackerRankStats(hackerrank),
          getCodeChefStats(codechef),
          getCodeforcesStats(codeforces),
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
            leetcode: leet,
            hackerrank: hack,
            codechef: chef,
            codeforces: cf,
          },
        };
      })
    );

    res.status(200).json({
      students: results,
    });
  } catch (error) {
    console.error("Error fetching students and stats:", error);
    res.status(500).json({ error: "Failed to fetch students and stats" });
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
    } = req.body;

    console.log(req.body);

    if (!name || !email || !rollNo) {
      return res
        .status(400)
        .json({ error: "Name, email, and roll number are required" });
    }

    const newStudent = new Student({
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
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ error: "Failed to add student" });
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
    };
  } catch {
    return { platform: "LeetCode", username, error: "Failed to fetch data" };
  }
}

async function getHackerRankStats(username) {
  const url = `https://www.hackerrank.com/${username}`;
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: `https://www.hackerrank.com/${username}`,
      },
    });
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
    console.error("Error fetching HackerRank stats:", error);
    return { platform: "HackerRank", username, error: "Failed to fetch data" };
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
      .trim();

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

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
