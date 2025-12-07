/**
 * Data Validator for ensuring consistency and accuracy of scraped data
 */
class DataValidator {
  constructor() {
    this.validationRules = {
      leetcode: this.validateLeetCode.bind(this),
      hackerrank: this.validateHackerRank.bind(this),
      codechef: this.validateCodeChef.bind(this),
      codeforces: this.validateCodeforces.bind(this),
      github: this.validateGitHub.bind(this),
      skillrack: this.validateSkillrack.bind(this),
    };
  }

  /**
   * Validate all platforms data
   */
  validateAll(stats) {
    const results = {
      valid: true,
      platforms: {},
      errors: [],
      warnings: [],
    };

    for (const [platform, data] of Object.entries(stats)) {
      if (this.validationRules[platform]) {
        const validation = this.validationRules[platform](data);
        results.platforms[platform] = validation;

        if (!validation.valid) {
          results.valid = false;
          results.errors.push(...validation.errors.map(e => `${platform}: ${e}`));
        }
        if (validation.warnings?.length > 0) {
          results.warnings.push(...validation.warnings.map(w => `${platform}: ${w}`));
        }
      }
    }

    return results;
  }

  /**
   * Validate LeetCode data
   */
  validateLeetCode(data) {
    const errors = [];
    const warnings = [];

    if (data.error) {
      return { valid: false, errors: [data.error], warnings };
    }

    if (!data.platform || data.platform !== 'LeetCode') {
      errors.push('Invalid platform identifier');
    }

    if (!data.solved || typeof data.solved !== 'object') {
      errors.push('Missing or invalid solved object');
    } else {
      const { All, Easy, Medium, Hard } = data.solved;
      
      if (typeof All !== 'number' || All < 0) {
        errors.push('Invalid total problems solved count');
      }
      
      if (All !== Easy + Medium + Hard) {
        warnings.push(`Sum mismatch: ${Easy + Medium + Hard} vs ${All}`);
      }

      if (All < 0 || Easy < 0 || Medium < 0 || Hard < 0) {
        errors.push('Negative problem counts detected');
      }
    }

    if (data.rating && (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 5000)) {
      warnings.push(`Unusual rating: ${data.rating}`);
    }

    if (data.contestCount && (typeof data.contestCount !== 'number' || data.contestCount < 0)) {
      errors.push('Invalid contest count');
    }

    if (data.streak && (typeof data.streak !== 'number' || data.streak < 0 || data.streak > 3650)) {
      warnings.push(`Unusual streak: ${data.streak} days`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings),
    };
  }

  /**
   * Validate HackerRank data
   */
  validateHackerRank(data) {
    const errors = [];
    const warnings = [];

    if (data.error) {
      return { valid: false, errors: [data.error], warnings };
    }

    if (!data.platform || data.platform !== 'HackerRank') {
      errors.push('Invalid platform identifier');
    }

    if (!Array.isArray(data.badges)) {
      errors.push('Badges must be an array');
    } else {
      data.badges.forEach((badge, idx) => {
        if (!badge.name || typeof badge.name !== 'string') {
          errors.push(`Badge ${idx}: Missing or invalid name`);
        }
        if (typeof badge.stars !== 'number' || badge.stars < 0 || badge.stars > 5) {
          errors.push(`Badge ${idx}: Invalid star count (${badge.stars})`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings),
    };
  }

  /**
   * Validate CodeChef data
   */
  validateCodeChef(data) {
    const errors = [];
    const warnings = [];

    if (data.error) {
      return { valid: false, errors: [data.error], warnings };
    }

    if (!data.platform || data.platform !== 'CodeChef') {
      errors.push('Invalid platform identifier');
    }

    if (data.rating !== null && data.rating !== undefined) {
      const rating = parseInt(data.rating, 10);
      if (isNaN(rating) || rating < 0 || rating > 5000) {
        errors.push(`Invalid rating: ${data.rating}`);
      }
    }

    if (data.fullySolved !== null && data.fullySolved !== undefined) {
      if (typeof data.fullySolved !== 'number' || data.fullySolved < 0) {
        errors.push('Invalid problems solved count');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings),
    };
  }

  /**
   * Validate Codeforces data
   */
  validateCodeforces(data) {
    const errors = [];
    const warnings = [];

    if (data.error) {
      return { valid: false, errors: [data.error], warnings };
    }

    if (!data.platform || data.platform !== 'Codeforces') {
      errors.push('Invalid platform identifier');
    }

    if (data.rating && data.rating !== 'Unrated') {
      const rating = parseInt(data.rating, 10);
      if (isNaN(rating) || rating < 0 || rating > 5000) {
        errors.push(`Invalid rating: ${data.rating}`);
      }
    }

    if (data.contests !== undefined) {
      if (typeof data.contests !== 'number' || data.contests < 0) {
        errors.push('Invalid contest count');
      }
    }

    if (data.problemsSolved !== undefined) {
      if (typeof data.problemsSolved !== 'number' || data.problemsSolved < 0) {
        errors.push('Invalid problems solved count');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings),
    };
  }

  /**
   * Validate GitHub data
   */
  validateGitHub(data) {
    const errors = [];
    const warnings = [];

    if (data.error) {
      return { valid: false, errors: [data.error], warnings };
    }

    if (typeof data.totalCommits !== 'number' || data.totalCommits < 0) {
      errors.push('Invalid total commits count');
    }

    if (typeof data.totalRepos !== 'number' || data.totalRepos < 0) {
      errors.push('Invalid total repos count');
    }

    if (!Array.isArray(data.topLanguages)) {
      errors.push('Top languages must be an array');
    }

    if (data.totalCommits > 50000) {
      warnings.push(`Very high commit count: ${data.totalCommits}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings),
    };
  }

  /**
   * Validate Skillrack data
   */
  validateSkillrack(data) {
    const errors = [];
    const warnings = [];

    if (data.error) {
      return { valid: false, errors: [data.error], warnings };
    }

    if (!data.platform || data.platform !== 'Skillrack') {
      errors.push('Invalid platform identifier');
    }

    if (data.rank !== undefined && (typeof data.rank !== 'number' || data.rank < 0)) {
      errors.push('Invalid rank');
    }

    if (typeof data.programsSolved !== 'number' || data.programsSolved < 0) {
      errors.push('Invalid programs solved count');
    }

    if (data.languages && typeof data.languages !== 'object') {
      errors.push('Languages must be an object');
    }

    if (!Array.isArray(data.certificates)) {
      errors.push('Certificates must be an array');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateScore(errors, warnings),
    };
  }

  /**
   * Calculate validation score (0-100)
   */
  calculateScore(errors, warnings) {
    const errorPenalty = errors.length * 25;
    const warningPenalty = warnings.length * 5;
    return Math.max(0, 100 - errorPenalty - warningPenalty);
  }

  /**
   * Compare old and new stats to detect anomalies
   */
  detectAnomalies(oldStats, newStats, platform) {
    const anomalies = [];

    if (!oldStats || !newStats) return anomalies;

    switch (platform) {
      case 'leetcode':
        if (oldStats.solved?.All && newStats.solved?.All) {
          const diff = newStats.solved.All - oldStats.solved.All;
          if (diff < 0) {
            anomalies.push(`Problems solved decreased by ${Math.abs(diff)}`);
          } else if (diff > 100) {
            anomalies.push(`Problems solved increased by ${diff} (unusual spike)`);
          }
        }
        break;

      case 'github':
        if (oldStats.totalCommits && newStats.totalCommits) {
          const diff = newStats.totalCommits - oldStats.totalCommits;
          if (diff < 0) {
            anomalies.push(`Commits decreased by ${Math.abs(diff)}`);
          }
        }
        break;

      case 'codechef':
        if (oldStats.fullySolved && newStats.fullySolved) {
          const diff = newStats.fullySolved - oldStats.fullySolved;
          if (diff < 0) {
            anomalies.push(`Problems solved decreased by ${Math.abs(diff)}`);
          }
        }
        break;
    }

    return anomalies;
  }
}

module.exports = DataValidator;
