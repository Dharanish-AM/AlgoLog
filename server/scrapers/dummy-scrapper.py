import asyncio
import aiohttp
from bs4 import BeautifulSoup
import re
import os

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/115.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
}

async def delay(ms):
    await asyncio.sleep(ms / 1000)


async def get_codechef_stats(username):
    url = f"https://www.codechef.com/users/{username}"
    max_attempts = 5

    async with aiohttp.ClientSession() as session:
        for attempt in range(1, max_attempts + 1):
            try:
                async with session.get(url, headers=HEADERS, timeout=15) as response:
                    data = await response.text()

                    if (
                        "The username specified does not exist" in data
                        or "404 Page Not Found" in data
                        or "not found" in data.lower()
                        or len(data.strip()) < 1000
                    ):
                        print(f"[CodeChef] ❌ User '{username}' not found.")
                        return {
                            "platform": "CodeChef",
                            "username": username,
                            "rating": None,
                            "fullySolved": None,
                        }

                    soup = BeautifulSoup(data, "html.parser")

                    # Extract rating
                    rating_div = soup.select_one("div.rating-number")
                    rating = (
                        rating_div.get_text(strip=True).replace("?", "")
                        if rating_div
                        else None
                    )

                    # Extract problems solved
                    fully_solved = 0
                    for h3 in soup.find_all("h3"):
                        if "Total Problems Solved" in h3.text:
                            solved_text = "".join(filter(str.isdigit, h3.text))
                            fully_solved = int(solved_text) if solved_text else 0
                            return {
                                "platform": "CodeChef",
                                "username": username,
                                "rating": rating,
                                "fullySolved": fully_solved,
                            }

                    # If no h3 with "Total Problems Solved" found, but rating present
                    if rating:
                        return {
                            "platform": "CodeChef",
                            "username": username,
                            "rating": rating,
                            "fullySolved": fully_solved,
                        }

                    raise ValueError("Invalid or empty CodeChef profile page")

            except Exception as e:
                print(
                    f"[CodeChef] ⚠️ Attempt {attempt} failed for {username}: {str(e)}"
                )
                if attempt < max_attempts:
                    await delay(3000 * attempt)
                else:
                    return {
                        "platform": "CodeChef",
                        "username": username,
                        "error": "Failed to fetch data after multiple attempts",
                    }
                
                
async def get_codeforces_stats(username):
    profile_url = f"https://codeforces.com/profile/{username}"
    contests_url = f"https://codeforces.com/contests/with/{username}"
    max_attempts = 5

    async with aiohttp.ClientSession() as session:
        for attempt in range(1, max_attempts + 1):
            try:
                async with session.get(profile_url, headers=HEADERS, timeout=15) as profile_res:
                    async with session.get(contests_url, headers=HEADERS, timeout=15) as contests_res:
                        profile_data = await profile_res.text()
                        contests_data = await contests_res.text()

                        if (
                            "Codeforces.showMessage(\"Can't find such user" in profile_data
                            or "showMessage(\"Can't find such user" in profile_data
                        ):
                            print(f"[Codeforces] ❌ User '{username}' not found.")
                            return {
                                "platform": "Codeforces",
                                "username": username,
                                "rating": None,
                                "rank": None,
                                "maxRating": None,
                                "contests": 0,
                                "problemsSolved": 0,
                            }

                        soup = BeautifulSoup(profile_data, "html.parser")
                        rating = soup.select_one('span[style="font-weight:bold;"].user-gray')
                        
                        rating = rating.get_text(strip=True) if rating else "Unrated"

                        rank_span = soup.select_one("div.user-rank > span")
                        rank = rank_span.get_text(strip=True) if rank_span else "Unranked"

                        smaller_text = soup.select_one("span.smaller")
                        if smaller_text:
                            match_max_rank = re.search(r"max\. (.*),", smaller_text.text)
                            max_rank = match_max_rank.group(1).strip() if match_max_rank else "N/A"

                            match_max_rating = re.search(r",\s*(\d+)", smaller_text.text)
                            max_rating = match_max_rating.group(1) if match_max_rating else "N/A"
                        else:
                            max_rank = "N/A"
                            max_rating = "N/A"

                        problems_solved_text = soup.get_text()
                        problems_solved_match = re.search(r"Problems solved:\s*(\d+)", problems_solved_text)
                        if not problems_solved_match:
                            problems_solved_el = soup.select_one("._UserActivityFrame_counterValue")
                            problems_solved_text_alt = problems_solved_el.get_text(strip=True) if problems_solved_el else "0"
                            problems_solved = int(re.search(r"\d+", problems_solved_text_alt).group(0)) if re.search(r"\d+", problems_solved_text_alt) else 0
                        else:
                            problems_solved = int(problems_solved_match.group(1))

                        contest_soup = BeautifulSoup(contests_data, "html.parser")
                        contests = len(contest_soup.select(".user-contests-table tbody tr"))

                        return {
                            "platform": "Codeforces",
                            "username": username,
                            "rating": rating,
                            "rank": rank,
                            "maxRating": max_rating,
                            "contests": contests,
                            "problemsSolved": problems_solved,
                        }

            except Exception as e:
                print(f"[Codeforces] ⚠️ Attempt {attempt} failed for {username}: {str(e)}")
                if attempt < max_attempts:
                    await delay(2000 * attempt)
                else:
                    return {
                        "platform": "Codeforces",
                        "username": username,
                        "error": "Failed to fetch data after multiple attempts",
                    }


# New function: get_hackerrank_stats
async def get_hackerrank_stats(username):
    url = f"https://www.hackerrank.com/{username}"
    max_attempts = 5

    async with aiohttp.ClientSession() as session:
        for attempt in range(1, max_attempts + 1):
            try:
                async with session.get(url, headers=HEADERS, timeout=20) as response:
                    html = await response.text()
                    soup = BeautifulSoup(html, "html.parser")

                    badge_elements = soup.select(".hacker-badge")[:5]
                    badges = []
                    for badge in badge_elements:
                        name_tag = badge.select_one(".badge-title")
                        name = name_tag.get_text(strip=True) if name_tag else ""
                        stars = len(badge.select(".badge-star"))
                        badges.append({"name": name, "stars": stars})

                    return {
                        "platform": "HackerRank",
                        "username": username,
                        "badges": badges,
                    }

            except Exception as e:
                print(f"[HackerRank] ⚠️ Attempt {attempt} failed for {username}: {str(e)}")
                if attempt < max_attempts:
                    await delay(2000 * attempt)
                else:
                    return {
                        "platform": "HackerRank",
                        "username": username,
                        "error": "Failed to fetch data after multiple attempts",
                    }


# New function: get_skillrack_stats
async def get_skillrack_stats(resume_url):
    if not resume_url or not resume_url.startswith("http"):
        return {
            "platform": "Skillrack",
            "error": "Skipped: Invalid or missing URL",
        }

    max_attempts = 5
    async with aiohttp.ClientSession() as session:
        for attempt in range(1, max_attempts + 1):
            try:
                async with session.get(resume_url, headers=HEADERS, timeout=5) as response:
                    html = await response.text()
                    soup = BeautifulSoup(html, "html.parser")

                    rank = 0
                    programs_solved = 0
                    languages = {}

                    for stat in soup.select("div.statistic"):
                        label = stat.select_one("div.label")
                        value = stat.select_one("div.value")
                        if not label or not value:
                            continue
                        label_text = label.get_text(strip=True).upper()
                        try:
                            value_num = int(value.get_text(strip=True))
                        except Exception:
                            continue

                        if "RANK" in label_text:
                            rank = value_num
                        elif "PROGRAMS SOLVED" in label_text:
                            programs_solved = value_num
                        elif label_text in ["JAVA", "C", "SQL", "PYTHON3", "CPP"]:
                            languages[label_text] = value_num

                    certificates = []
                    for card in soup.select("div.ui.brown.card"):
                        content = card.select_one("div.content")
                        if not content:
                            continue
                        title_tag = content.select_one("b")
                        title = title_tag.get_text(strip=True) if title_tag else ""
                        date_match = re.search(r"\d{2}-\d{2}-\d{4}( \d{2}:\d{2})?", content.get_text())
                        date = date_match.group(0) if date_match else ""
                        link_tag = content.select_one("a")
                        link = link_tag["href"] if link_tag and link_tag.has_attr("href") else ""

                        if title and link:
                            certificates.append({"title": title, "date": date, "link": link})

                    if rank == 0 and programs_solved == 0 and not certificates:
                        raise ValueError("Invalid Skillrack URL")

                    return {
                        "platform": "Skillrack",
                        "rank": rank,
                        "programsSolved": programs_solved,
                        "languages": languages,
                        "certificates": certificates,
                    }

            except Exception as e:
                print(f"[Skillrack] ⚠️ Attempt {attempt} failed: {str(e)}")
                if attempt < max_attempts:
                    await delay(1000 * attempt)
                else:
                    return {
                        "platform": "Skillrack",
                        "error": "Failed to fetch data",
                    }


async def get_github_stats(username: str, token: str):
    if not token:
        return {
            "platform": "GitHub",
            "username": username,
            "error": "GitHub token not provided",
        }
    query = """
    query($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER) {
          totalCount
          nodes {
            name
            defaultBranchRef {
              target {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
              }
            }
            languages(first: 10) {
              edges {
                node {
                  name
                }
                size
              }
            }
          }
        }
      }
    }
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": HEADERS["User-Agent"],
    }
    variables = {"login": username}
    url = "https://api.github.com/graphql"

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, json={"query": query, "variables": variables}, headers=headers, timeout=20) as resp:
                if resp.status != 200:
                    return {
                        "platform": "GitHub",
                        "username": username,
                        "error": f"GitHub API returned status {resp.status}",
                    }
                result = await resp.json()
                user_data = result.get("data", {}).get("user")
                if not user_data:
                    return {
                        "platform": "GitHub",
                        "username": username,
                        "error": "User not found or no data",
                    }
                repos = user_data.get("repositories", {}).get("nodes", [])
                total_repos = user_data.get("repositories", {}).get("totalCount", 0)
                total_commits = 0
                language_sizes = {}
                for repo in repos:
                    default_branch = repo.get("defaultBranchRef")
                    if default_branch:
                        target = default_branch.get("target")
                        if target and "history" in target:
                            total_commits += target["history"].get("totalCount", 0)
                    languages = repo.get("languages", {}).get("edges", [])
                    for lang_edge in languages:
                        lang_name = lang_edge["node"]["name"]
                        size = lang_edge["size"]
                        language_sizes[lang_name] = language_sizes.get(lang_name, 0) + size
                return {
                    "platform": "GitHub",
                    "username": username,
                    "totalRepos": total_repos,
                    "totalCommits": total_commits,
                    "languages": language_sizes,
                }
        except Exception as e:
            return {
                "platform": "GitHub",
                "username": username,
                "error": f"Exception: {str(e)}",
            }


async def get_leetcode_stats(username: str):
    url = "https://leetcode.com/graphql"
    query = """
    query userContestRankingInfo($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
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
    }
    """
    variables = {"username": username}
    headers = {
        "Content-Type": "application/json",
        "User-Agent": HEADERS["User-Agent"],
    }
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, json={"query": query, "variables": variables}, headers=headers, timeout=20) as resp:
                if resp.status != 200:
                    return {
                        "platform": "LeetCode",
                        "username": username,
                        "error": f"LeetCode API returned status {resp.status}",
                    }
                data = await resp.json()
                d = data.get("data", {})
                user = d.get("matchedUser")
                if not user:
                    return {
                        "platform": "LeetCode",
                        "username": username,
                        "error": "User not found",
                    }
                ac_submissions = user.get("submitStats", {}).get("acSubmissionNum", [])
                total_solved = sum(item.get("count", 0) for item in ac_submissions)
                contest_ranking = d.get("userContestRanking", {})
                # contest_ranking may be None if user never attended a contest
                rating = contest_ranking.get("rating") if contest_ranking else None
                global_rank = contest_ranking.get("globalRanking") if contest_ranking else None
                contests = contest_ranking.get("totalParticipants") if contest_ranking else None
                badge_list = []
                badge = contest_ranking.get("badge") if contest_ranking else None
                if badge and badge.get("name"):
                    badge_list.append({"name": badge.get("name")})
                # Optionally, include contest history
                contest_history = d.get("userContestRankingHistory", [])
                return {
                    "platform": "LeetCode",
                    "username": username,
                    "totalSolved": total_solved,
                    "rating": rating,
                    "globalRank": global_rank,
                    "contests": contests,
                    "badges": badge_list,
                    "contestHistory": contest_history,
                }
        except Exception as e:
            return {
                "platform": "LeetCode",
                "username": username,
                "error": f"Exception: {str(e)}",
            }


async def main():
    results = await asyncio.gather(
        get_codechef_stats("iam_elango"),
        get_codeforces_stats("guruvishal_30"),
        get_hackerrank_stats("ranajay_s2021"),
        get_skillrack_stats("https://www.skillrack.com/faces/resume.xhtml?id=484165&key=1f236d3e2580bca08af0f26cf6084fa6a9ce34cc"),
        get_github_stats("sabarim6369"),
        get_leetcode_stats("dharanisham")
    )
    for result in results:
        print(result)

asyncio.run(main())