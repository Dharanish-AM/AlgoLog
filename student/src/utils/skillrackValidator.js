/**
 * Client-side Skillrack URL Validator
 * Supports multiple Skillrack URL formats
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
export function validateSkillrackUrl(url) {
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
  if (trimmedUrl.includes("skillrack.com")) {
    return {
      valid: false,
      format: "malformed",
      message:
        "Skillrack URL format is not supported. Use either:\n" +
        "1) https://www.skillrack.com/faces/resume.xhtml?id=<id>&key=<key>\n" +
        "2) https://www.skillrack.com/profile/<id>/<key>",
      url: trimmedUrl,
    };
  }

  return {
    valid: false,
    format: null,
    message:
      "Not a valid Skillrack URL. Expected format:\n" +
      "https://www.skillrack.com/profile/<id>/<key> or\n" +
      "https://www.skillrack.com/faces/resume.xhtml?id=<id>&key=<key>",
  };
}

/**
 * Gets user-friendly error message for Skillrack validation
 * @param {string} url - The URL that failed validation
 * @returns {string} User-friendly error message
 */
export function getSkillrackErrorMessage(url) {
  const result = validateSkillrackUrl(url);
  if (result.valid) return "";

  return result.message;
}

/**
 * Checks if URL is a valid Skillrack URL
 * @param {string} url - The URL to check
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidSkillrackUrl(url) {
  return validateSkillrackUrl(url).valid;
}
