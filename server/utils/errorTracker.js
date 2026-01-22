/**
 * Persistent Error Tracker
 * Tracks profile failures, error patterns, and identifies consistently failing profiles
 * Helps improve retry strategy and skip logic
 */

const fs = require('fs');
const path = require('path');

class ErrorTracker {
  constructor(logDir = path.join(__dirname, '../logs')) {
    this.logDir = logDir;
    this.errorFile = path.join(this.logDir, 'error-tracking.json');
    this.data = this.loadData();
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  loadData() {
    try {
      if (fs.existsSync(this.errorFile)) {
        const content = fs.readFileSync(this.errorFile, 'utf-8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn('Failed to load error tracking data:', err.message);
    }

    return {
      profiles: {},
      platforms: {},
      errorPatterns: {},
      batchSummaries: [],
      lastUpdated: null,
    };
  }

  saveData() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.errorFile, JSON.stringify(this.data, null, 2));
    } catch (err) {
      console.error('Failed to save error tracking data:', err.message);
    }
  }

  /**
   * Track a profile error
   * @param {string} platform - e.g., 'codeforces', 'codechef', 'github'
   * @param {string} username - user's profile username
   * @param {number} statusCode - HTTP status code
   * @param {string} errorMessage - error message
   * @param {string} errorType - 'rate-limit', 'invalid-profile', 'not-found', 'server-error', 'timeout', 'other'
   */
  trackError(platform, username, statusCode, errorMessage, errorType = 'other') {
    const profileKey = `${platform}:${username}`;

    if (!this.data.profiles[profileKey]) {
      this.data.profiles[profileKey] = {
        platform,
        username,
        firstError: new Date().toISOString(),
        lastError: new Date().toISOString(),
        errorCount: 0,
        successCount: 0,
        errors: [],
        errorTypes: {},
        statusCodes: {},
        shouldSkip: false,
        skipReason: null,
        recoveryAttempts: 0,
      };
    }

    const profile = this.data.profiles[profileKey];
    profile.lastError = new Date().toISOString();
    profile.errorCount += 1;

    // Track error type
    profile.errorTypes[errorType] = (profile.errorTypes[errorType] || 0) + 1;
    profile.statusCodes[statusCode] = (profile.statusCodes[statusCode] || 0) + 1;

    // Store recent errors (last 5)
    if (profile.errors.length >= 5) {
      profile.errors.shift();
    }
    profile.errors.push({
      timestamp: new Date().toISOString(),
      statusCode,
      message: errorMessage,
      type: errorType,
    });

    // Mark for skipping if consistent failures
    if (profile.errorCount >= 3 && profile.statusCodes[400]) {
      // 3+ failures with 400 errors (invalid profile)
      profile.shouldSkip = true;
      profile.skipReason = `Invalid profile: ${profile.errorCount} failures (${errorMessage})`;
    } else if (profile.errorCount >= 5 && profile.errorTypes['rate-limit']) {
      // 5+ rate limit failures
      profile.shouldSkip = true;
      profile.skipReason = `Rate limited repeatedly: ${profile.errorCount} failures`;
    }

    // Track platform-level errors
    if (!this.data.platforms[platform]) {
      this.data.platforms[platform] = {
        totalErrors: 0,
        successCount: 0,
        errorTypes: {},
        statusCodes: {},
      };
    }

    this.data.platforms[platform].totalErrors += 1;
    this.data.platforms[platform].errorTypes[errorType] = 
      (this.data.platforms[platform].errorTypes[errorType] || 0) + 1;
    this.data.platforms[platform].statusCodes[statusCode] = 
      (this.data.platforms[platform].statusCodes[statusCode] || 0) + 1;

    this.saveData();
  }

  /**
   * Track a successful profile fetch
   */
  trackSuccess(platform, username) {
    const profileKey = `${platform}:${username}`;

    if (!this.data.profiles[profileKey]) {
      this.data.profiles[profileKey] = {
        platform,
        username,
        firstError: null,
        lastError: null,
        errorCount: 0,
        successCount: 0,
        errors: [],
        errorTypes: {},
        statusCodes: {},
        shouldSkip: false,
        skipReason: null,
        recoveryAttempts: 0,
      };
    }

    const profile = this.data.profiles[profileKey];
    profile.successCount += 1;

    // Reset skip status if recovering
    if (profile.shouldSkip) {
      profile.recoveryAttempts += 1;
      if (profile.successCount > profile.errorCount) {
        profile.shouldSkip = false;
        profile.skipReason = null;
      }
    }

    // Track platform-level success
    if (this.data.platforms[platform]) {
      this.data.platforms[platform].successCount += 1;
    }

    this.saveData();
  }

  /**
   * Check if a profile should be skipped
   */
  shouldSkipProfile(platform, username) {
    const profileKey = `${platform}:${username}`;
    const profile = this.data.profiles[profileKey];
    return profile?.shouldSkip || false;
  }

  /**
   * Get skip reason for a profile
   */
  getSkipReason(platform, username) {
    const profileKey = `${platform}:${username}`;
    const profile = this.data.profiles[profileKey];
    return profile?.skipReason || null;
  }

  /**
   * Get all consistently failing profiles
   */
  getFailingProfiles() {
    return Object.entries(this.data.profiles)
      .filter(([_, profile]) => profile.shouldSkip)
      .map(([key, profile]) => ({
        platform: profile.platform,
        username: profile.username,
        errorCount: profile.errorCount,
        skipReason: profile.skipReason,
        lastError: profile.lastError,
      }));
  }

  /**
   * Get error summary for a batch
   */
  getBatchSummary(batchNumber) {
    const platforms = this.data.platforms;
    const summary = {
      batchNumber,
      timestamp: new Date().toISOString(),
      platforms: {},
      topFailingProfiles: this.getFailingProfiles().slice(0, 10),
      recommendations: [],
    };

    for (const [platform, data] of Object.entries(platforms)) {
      const totalAttempts = data.totalErrors + data.successCount;
      const successRate = totalAttempts > 0 ? 
        ((data.successCount / totalAttempts) * 100).toFixed(1) : 'N/A';

      summary.platforms[platform] = {
        successCount: data.successCount,
        totalErrors: data.totalErrors,
        successRate: `${successRate}%`,
        errorTypes: data.errorTypes,
        topErrors: Object.entries(data.statusCodes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([code, count]) => `${code}: ${count}x`),
      };

      // Generate recommendations
      if (data.totalErrors > data.successCount * 2) {
        summary.recommendations.push(
          `⚠️  ${platform}: Error rate too high (${data.totalErrors} errors). ` +
          `Consider reducing concurrency or checking API status.`
        );
      }
    }

    this.data.batchSummaries.push(summary);
    this.saveData();
    return summary;
  }

  /**
   * Reset error tracking for a new batch
   */
  resetForNewBatch() {
    // Reset platform-level counters but keep profile history
    for (const platform in this.data.platforms) {
      this.data.platforms[platform].totalErrors = 0;
      this.data.platforms[platform].successCount = 0;
      this.data.platforms[platform].errorTypes = {};
      this.data.platforms[platform].statusCodes = {};
    }
    this.saveData();
  }

  /**
   * Get detailed profile history
   */
  getProfileHistory(platform, username) {
    const profileKey = `${platform}:${username}`;
    return this.data.profiles[profileKey] || null;
  }

  /**
   * Clear all data (use with caution)
   */
  clearAll() {
    this.data = {
      profiles: {},
      platforms: {},
      errorPatterns: {},
      batchSummaries: [],
      lastUpdated: null,
    };
    this.saveData();
  }

  /**
   * Export error report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalProfiles: Object.keys(this.data.profiles).length,
      failingProfiles: this.getFailingProfiles().length,
      platformsSummary: this.data.platforms,
      recentBatchSummaries: this.data.batchSummaries.slice(-5),
    };

    return report;
  }
}

module.exports = ErrorTracker;
