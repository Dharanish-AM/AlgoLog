/**
 * Skillrack URL Validator (Server-side version)
 * Validates Skillrack URLs for both resume and profile formats
 */

/**
 * Validates if a string is a valid Skillrack URL
 * Supported formats:
 * 1. Resume format: https://www.skillrack.com/faces/resume.xhtml?id=123456&key=abcdef1234567890
 * 2. Profile format: https://www.skillrack.com/profile/484170/384bf14cad47206d972111ec7b5b67a8e41e9742
 *
 * @param {string} url - The URL to validate
 * @returns {object} { valid: boolean, format: string|null, message: string }
 */
function validateSkillrackUrl(url) {
  if (!url || typeof url !== "string") {
    return {
      valid: false,
      format: null,
      message: "URL is required and must be a string",
    };
  }

  const trimmedUrl = url.trim();

  // Format 1: Resume with query params
  const resumeRegex =
    /^https:\/\/www\.skillrack\.com\/faces\/resume\.xhtml\?id=\d+&key=[a-fA-F0-9]+$/;
  if (resumeRegex.test(trimmedUrl)) {
    return {
      valid: true,
      format: "resume",
      message: "Valid resume format URL",
      url: trimmedUrl,
    };
  }

  // Format 2: Profile format (supports both http and https)
  const profileRegex =
    /^https?:\/\/www\.skillrack\.com\/profile\/\d+\/[a-fA-F0-9]+$/;
  if (profileRegex.test(trimmedUrl)) {
    return {
      valid: true,
      format: "profile",
      message: "Valid profile format URL",
      url: trimmedUrl,
    };
  }

  // Additional validation: Check for common malformed URLs
  if (!trimmedUrl.includes("skillrack.com")) {
    return {
      valid: false,
      format: null,
      message: "URL does not contain skillrack.com domain",
    };
  }

  if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
    return {
      valid: false,
      format: null,
      message: "URL must start with http:// or https://",
    };
  }

  return {
    valid: false,
    format: null,
    message: "URL does not match recognized Skillrack URL patterns",
  };
}

/**
 * Checks if URL is a valid Skillrack URL
 * @param {string} url - The URL to check
 * @returns {boolean} True if valid, false otherwise
 */
function isValidSkillrackUrl(url) {
  return validateSkillrackUrl(url).valid;
}

// Export for Node.js/server usage
module.exports = { validateSkillrackUrl, isValidSkillrackUrl };
