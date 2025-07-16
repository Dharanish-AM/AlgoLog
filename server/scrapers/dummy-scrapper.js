const axios = require("axios");
const cheerio = require("cheerio");

function logContest(contest, index) {
  console.log(`\n#${index + 1} [${contest.platform}] ${contest.title}`);
  console.log(`- ID: ${contest.contestId}`);
  console.log(`- Start: ${contest.startTime}`);
  console.log(`- Duration (s): ${contest.duration}`);
  console.log(`- URL: ${contest.url}`);
  console.log(`- Status: ${contest.status}`);
}

async function fetchLeetCodeContests() {
  try {
    console.log("🔍 Fetching LeetCode contests...");
    const res = await axios.get("https://leetcode.com/contest/api/list/", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    });
    const contests = res.data.contests.map((c) => ({
      platform: "LeetCode",
      contestId: c.title_slug,
      title: c.title,
      startTime: new Date(c.start_time * 1000),
      duration: c.duration,
      url: `https://leetcode.com/contest/${c.title_slug}/`,
      status: c.is_virtual
        ? "FINISHED"
        : c.start_time * 1000 > Date.now()
        ? "UPCOMING"
        : "FINISHED",
    }));
    console.log(`✅ LeetCode contests fetched: ${contests.length}`);
    return contests;
  } catch (err) {
    console.error("❌ Error fetching LeetCode contests:", err.message);
    return [];
  }
}

async function fetchCodeforcesContests() {
  //working
  try {
    console.log("🔍 Fetching Codeforces contests...");
    const res = await axios.get("https://codeforces.com/api/contest.list");
    const contests = res.data.result.slice(0, 50).map((c) => ({
      platform: "Codeforces",
      contestId: c.id.toString(),
      title: c.name,
      startTime: new Date(c.startTimeSeconds * 1000),
      duration: c.durationSeconds,
      url: `https://codeforces.com/contest/${c.id}`,
      status:
        c.phase === "BEFORE"
          ? "UPCOMING"
          : c.phase === "FINISHED"
          ? "FINISHED"
          : "ONGOING",
    }));
    console.log(`✅ Codeforces contests fetched: ${contests.length}`);
    return contests;
  } catch (err) {
    console.error("❌ Error fetching Codeforces contests:", err.message);
    return [];
  }
}

async function fetchCodeChefContests() {
  try {
    console.log("🔍 Fetching CodeChef contests...");
    const res = await axios.get("https://www.codechef.com/contests", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    console.log("Response:", res.data);

    const $ = cheerio.load(res.data);
    const contests = [];

    $("div._dataTable__container_14pun_417").each((_, el) => {
      const container = $(el);
      const title = container.find("._subtitle_14pun_544").text().trim(); // "Starters 195"
      const startText = container.text().match(/Starts in\s(.*?)\s/); // Extract time like "21 Hrs 6 Min"
      const startTime = startText ? `Starts in ${startText[1]}` : "N/A";

      if (title) {
        contests.push({
          platform: "CodeChef",
          contestId: title.toLowerCase().replace(/\s+/g, "-"),
          title,
          startTime,
          duration: 0,
          url: `https://www.codechef.com/contests`, // CodeChef doesn’t link directly to individual contests
          status: "UPCOMING",
        });
      }
    });

    console.log(`✅ CodeChef contests fetched: ${contests.length}`);
    return contests;
  } catch (err) {
    console.error("❌ Error fetching CodeChef contests:", err.message);
    return [];
  }
}

async function fetchHackerRankContests() {
  try {
    console.log("🔍 Fetching HackerRank contests...");
    const res = await axios.get("https://www.hackerrank.com/contests", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(res.data);
    const contests = [];

    $("div.contest-card-wrapper").each((_, el) => {
      const title = $(el).find(".contest-name").text().trim();
      const url = "https://www.hackerrank.com" + $(el).find("a").attr("href");
      const startTime = new Date(
        $(el).find("meta[itemprop='startDate']").attr("content")
      );
      const durationHours = $(el)
        .find(".contest-duration")
        .text()
        .trim()
        .match(/\d+/);
      const duration = durationHours ? parseInt(durationHours[0]) * 60 * 60 : 0;

      contests.push({
        platform: "HackerRank",
        contestId: title.toLowerCase().replace(/\s+/g, "-"),
        title,
        startTime,
        duration,
        url,
        status: startTime > new Date() ? "UPCOMING" : "FINISHED",
      });
    });

    console.log(`✅ HackerRank contests fetched: ${contests.length}`);
    return contests;
  } catch (err) {
    console.error("❌ Error fetching HackerRank contests:", err.message);
    return [];
  }
}

async function runTempContestFetch() {
  console.log("\n🚀 Starting Contest Fetch...\n");

  const leetcodeContests = await fetchLeetCodeContests();
  const codeforcesContests = await fetchCodeforcesContests();
  const codechefContests = await fetchCodeChefContests();
  const hackerrankContests = await fetchHackerRankContests();

  const allContests = [
    ...leetcodeContests,
    ...codeforcesContests,
    ...codechefContests,
    ...hackerrankContests,
  ];

  console.log(`\n🎯 Total Contests Fetched: ${allContests.length}\n`);

  allContests.forEach((c, i) => logContest(c, i));

  return allContests;
}

// Run fetcher
// runTempContestFetch();
fetchCodeChefContests();