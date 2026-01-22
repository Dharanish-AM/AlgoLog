/**
 * Batch Error Report Generator
 * Creates detailed error analysis and recommendations after batch processing
 */

const ErrorTracker = require('./errorTracker');

class BatchErrorReporter {
  constructor(errorTracker) {
    this.errorTracker = errorTracker;
  }

  /**
   * Generate comprehensive error report after batch completion
   */
  generateReport(batchNumber, studentsFailed, totalStudents) {
    const failingProfiles = this.errorTracker.getFailingProfiles();
    const platformReport = this.errorTracker.data.platforms;
    
    const report = {
      timestamp: new Date().toISOString(),
      batchNumber,
      summary: {
        totalStudents,
        failedStudents: studentsFailed.length,
        failureRate: `${((studentsFailed.length / totalStudents) * 100).toFixed(1)}%`,
        consistentlyFailingProfiles: failingProfiles.length,
      },
      failedStudents: studentsFailed.map(student => ({
        name: student.name,
        rollNo: student.rollNo,
        failedPlatforms: student.failedPlatforms || [],
        errorMessages: student.errorMessages || [],
      })),
      platformAnalysis: this.analyzePlatformErrors(platformReport),
      recommendations: this.generateRecommendations(
        failingProfiles,
        platformReport,
        studentsFailed.length,
        totalStudents
      ),
      skipListNextBatch: failingProfiles.map(p => ({
        platform: p.platform,
        username: p.username,
        reason: p.skipReason,
      })),
    };

    return report;
  }

  /**
   * Analyze errors by platform
   */
  analyzePlatformErrors(platformReport) {
    const analysis = {};

    for (const [platform, data] of Object.entries(platformReport)) {
      const totalAttempts = data.totalErrors + data.successCount;
      if (totalAttempts === 0) continue;

      const errorRate = (data.totalErrors / totalAttempts) * 100;
      const topErrors = Object.entries(data.statusCodes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([code, count]) => ({
          code,
          count,
          percentage: `${((count / totalAttempts) * 100).toFixed(1)}%`,
        }));

      analysis[platform] = {
        successRate: `${((data.successCount / totalAttempts) * 100).toFixed(1)}%`,
        errorRate: `${errorRate.toFixed(1)}%`,
        totalAttempts,
        successes: data.successCount,
        failures: data.totalErrors,
        errorTypes: data.errorTypes,
        topErrors,
        severity: this.calculateSeverity(errorRate),
      };
    }

    return analysis;
  }

  /**
   * Calculate error severity
   */
  calculateSeverity(errorRate) {
    if (errorRate >= 50) return '🔴 CRITICAL';
    if (errorRate >= 30) return '🟠 HIGH';
    if (errorRate >= 10) return '🟡 MEDIUM';
    return '🟢 LOW';
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(failingProfiles, platformReport, failedCount, totalCount) {
    const recommendations = [];
    const failureRate = (failedCount / totalCount) * 100;

    // Overall recommendations
    if (failureRate > 30) {
      recommendations.push(
        '⚠️  Overall failure rate is HIGH. Consider reducing batch size or concurrency.'
      );
    }

    // Platform-specific recommendations
    for (const [platform, data] of Object.entries(platformReport)) {
      const totalAttempts = data.totalErrors + data.successCount;
      if (totalAttempts === 0) continue;

      const errorRate = (data.totalErrors / totalAttempts) * 100;

      if (data.statusCodes[429]) {
        const rateLimitCount = data.statusCodes[429];
        recommendations.push(
          `⏳ ${platform}: ${rateLimitCount} rate-limit errors (429). ` +
          `Increase minTime between requests or reduce maxConcurrent from current levels.`
        );
      }

      if (data.statusCodes[400]) {
        const badRequestCount = data.statusCodes[400];
        recommendations.push(
          `❌ ${platform}: ${badRequestCount} invalid profile errors (400). ` +
          `Validate usernames before fetching or skip profiles with repeated 400 errors.`
        );
      }

      if (errorRate > 50) {
        recommendations.push(
          `🔴 ${platform}: ${errorRate.toFixed(1)}% error rate is CRITICAL. ` +
          `Check API status, authentication, or network connectivity.`
        );
      }
    }

    // Profile recommendations
    if (failingProfiles.length > 0) {
      recommendations.push(
        `🚫 Skip ${failingProfiles.length} profile(s) in next batch (${failingProfiles.length} consistent failures).`
      );
    }

    return recommendations;
  }

  /**
   * Format report as readable string
   */
  formatAsString(report) {
    let output = '\n';
    output += '═'.repeat(70) + '\n';
    output += `📊 BATCH ${report.batchNumber} ERROR REPORT\n`;
    output += '═'.repeat(70) + '\n\n';

    output += `📈 Summary:\n`;
    output += `  • Total Students: ${report.summary.totalStudents}\n`;
    output += `  • Failed Students: ${report.summary.failedStudents} (${report.summary.failureRate})\n`;
    output += `  • Consistently Failing Profiles: ${report.summary.consistentlyFailingProfiles}\n\n`;

    output += `🔍 Platform Analysis:\n`;
    for (const [platform, analysis] of Object.entries(report.platformAnalysis)) {
      output += `  ${platform.toUpperCase()} ${analysis.severity}\n`;
      output += `    ✅ Success Rate: ${analysis.successRate}\n`;
      output += `    ❌ Error Rate: ${analysis.errorRate}\n`;
      if (analysis.topErrors.length > 0) {
        output += `    Top Errors:\n`;
        analysis.topErrors.forEach(err => {
          output += `      • [${err.code}]: ${err.count}x (${err.percentage})\n`;
        });
      }
    }

    output += `\n💡 Recommendations:\n`;
    report.recommendations.forEach(rec => {
      output += `  • ${rec}\n`;
    });

    if (report.skipListNextBatch.length > 0) {
      output += `\n🚫 Skip List (Next Batch):\n`;
      report.skipListNextBatch.forEach(item => {
        output += `  • ${item.platform}:${item.username} - ${item.reason}\n`;
      });
    }

    output += '\n' + '═'.repeat(70) + '\n';
    return output;
  }

  /**
   * Save report to file
   */
  saveToFile(report, filePath) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to ${filePath}`);
  }
}

module.exports = BatchErrorReporter;
