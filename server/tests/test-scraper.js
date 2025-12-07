const {
  getLeetCodeStats,
  getHackerRankStats,
  getGithubStats,
  getCodeChefStats,
  getSkillrackStats,
  getCodeforcesStats,
} = require('../scrapers/scraper.js');

// Test data from the provided student record
const testUser = {
  name: "Bavanetha M R",
  leetcode: "Bavanetha27",
  hackerrank: "bavanetha_mr2021",
  codechef: "bavanethamr",
  codeforces: "Bavanetha_MR",
  skillrack: "https://www.skillrack.com/faces/resume.xhtml?id=484173&key=e1ba0b2228c172431cc1f4ae6a92171ce263be9d",
  github: "Bavanetha27",
};

async function testScraper() {
  console.log('🚀 Starting scraper tests...\n');
  console.log('Testing with user:', testUser.name);
  console.log('=' .repeat(60));

  const results = {};
  const startTime = Date.now();

  // Test all platforms concurrently for maximum speed
  console.log('\n⏱️  Testing concurrent scraping...\n');

  try {
    const [
      leetcodeResult,
      hackerrankResult,
      codechefResult,
      codeforcesResult,
      githubResult,
      skillrackResult,
    ] = await Promise.allSettled([
      testPlatform('LeetCode', () => getLeetCodeStats(testUser.leetcode)),
      testPlatform('HackerRank', () => getHackerRankStats(testUser.hackerrank)),
      testPlatform('CodeChef', () => getCodeChefStats(testUser.codechef)),
      testPlatform('Codeforces', () => getCodeforcesStats(testUser.codeforces)),
      testPlatform('GitHub', () => getGithubStats(testUser.github)),
      testPlatform('Skillrack', () => getSkillrackStats(testUser.skillrack)),
    ]);

    results.leetcode = leetcodeResult.value;
    results.hackerrank = hackerrankResult.value;
    results.codechef = codechefResult.value;
    results.codeforces = codeforcesResult.value;
    results.github = githubResult.value;
    results.skillrack = skillrackResult.value;

    const totalTime = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTS SUMMARY');
    console.log('='.repeat(60));

    // Display results for each platform
    displayResults(results);

    console.log('\n' + '='.repeat(60));
    console.log(`⏱️  Total execution time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    // Test caching by running again
    console.log('\n🔄 Testing cache (running again)...\n');
    const cacheStartTime = Date.now();
    
    await Promise.all([
      getLeetCodeStats(testUser.leetcode),
      getHackerRankStats(testUser.hackerrank),
      getCodeChefStats(testUser.codechef),
      getCodeforcesStats(testUser.codeforces),
      getGithubStats(testUser.github),
      getSkillrackStats(testUser.skillrack),
    ]);

    const cacheTime = Date.now() - cacheStartTime;
    console.log(`✅ Cached results retrieved in ${cacheTime}ms`);
    console.log(`🚀 Speed improvement: ${((totalTime - cacheTime) / totalTime * 100).toFixed(1)}% faster!\n`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testPlatform(name, scrapeFunction) {
  const start = Date.now();
  console.log(`🔍 Scraping ${name}...`);
  
  try {
    const result = await scrapeFunction();
    const duration = Date.now() - start;
    
    if (result.error) {
      console.log(`⚠️  ${name} completed with error in ${duration}ms: ${result.error}`);
    } else {
      console.log(`✅ ${name} completed in ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`❌ ${name} failed in ${duration}ms: ${error.message}`);
    return { error: error.message };
  }
}

function displayResults(results) {
  // LeetCode
  console.log('\n📘 LeetCode:');
  if (results.leetcode?.error) {
    console.log(`   ❌ Error: ${results.leetcode.error}`);
  } else if (results.leetcode) {
    console.log(`   Total Solved: ${results.leetcode.solved?.All || 0}`);
    console.log(`   Easy: ${results.leetcode.solved?.Easy || 0} | Medium: ${results.leetcode.solved?.Medium || 0} | Hard: ${results.leetcode.solved?.Hard || 0}`);
    console.log(`   Rating: ${results.leetcode.rating || 0}`);
    console.log(`   Contest Count: ${results.leetcode.contestCount || 0}`);
    console.log(`   Streak: ${results.leetcode.streak || 0} days`);
    console.log(`   Languages: ${results.leetcode.languageStats?.length || 0} languages`);
    console.log(`   Badges: ${results.leetcode.badges?.length || 0}`);
  }

  // HackerRank
  console.log('\n📗 HackerRank:');
  if (results.hackerrank?.error) {
    console.log(`   ❌ Error: ${results.hackerrank.error}`);
  } else if (results.hackerrank) {
    console.log(`   Badges: ${results.hackerrank.badges?.length || 0}`);
    results.hackerrank.badges?.forEach(badge => {
      console.log(`   - ${badge.name}: ${'⭐'.repeat(badge.stars)}`);
    });
  }

  // CodeChef
  console.log('\n📙 CodeChef:');
  if (results.codechef?.error) {
    console.log(`   ❌ Error: ${results.codechef.error}`);
  } else if (results.codechef) {
    console.log(`   Rating: ${results.codechef.rating || 'Unrated'}`);
    console.log(`   Problems Solved: ${results.codechef.fullySolved || 0}`);
  }

  // Codeforces
  console.log('\n📕 Codeforces:');
  if (results.codeforces?.error) {
    console.log(`   ❌ Error: ${results.codeforces.error}`);
  } else if (results.codeforces) {
    console.log(`   Rating: ${results.codeforces.rating || 'Unrated'}`);
    console.log(`   Max Rating: ${results.codeforces.maxRating || 'N/A'}`);
    console.log(`   Rank: ${results.codeforces.rank || 'Unranked'}`);
    console.log(`   Contests: ${results.codeforces.contests || 0}`);
    console.log(`   Problems Solved: ${results.codeforces.problemsSolved || 0}`);
  }

  // GitHub
  console.log('\n📓 GitHub:');
  if (results.github?.error) {
    console.log(`   ❌ Error: ${results.github.error}`);
  } else if (results.github) {
    console.log(`   Total Commits: ${results.github.totalCommits || 0}`);
    console.log(`   Total Repos: ${results.github.totalRepos || 0}`);
    console.log(`   Top Languages: ${results.github.topLanguages?.map(l => l.name).join(', ') || 'None'}`);
  }

  // Skillrack
  console.log('\n📔 Skillrack:');
  if (results.skillrack?.error) {
    console.log(`   ❌ Error: ${results.skillrack.error}`);
  } else if (results.skillrack) {
    console.log(`   Rank: ${results.skillrack.rank || 'N/A'}`);
    console.log(`   Programs Solved: ${results.skillrack.programsSolved || 0}`);
    if (results.skillrack.languages) {
      console.log(`   Languages:`);
      Object.entries(results.skillrack.languages).forEach(([lang, count]) => {
        console.log(`      ${lang}: ${count}`);
      });
    }
    console.log(`   Certificates: ${results.skillrack.certificates?.length || 0}`);
  }
}

// Run the test
testScraper().then(() => {
  console.log('\n✨ Test completed!\n');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Test crashed:', error);
  process.exit(1);
});
