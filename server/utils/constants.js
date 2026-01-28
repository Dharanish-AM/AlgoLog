/**
 * Centralized Academic Year Constants
 * Add new academic years at the top of the array
 * Format: "YYYY-YYYY" (e.g., "2027-2031" for batch joining in 2027)
 */

const ACADEMIC_YEARS = [
  "2027-2031",
  "2026-2030",
  "2025-2029",
  "2024-2028",
  "2023-2027",
];

/**
 * Validate if a given year is a valid academic year
 * @param {string} year - Academic year to validate
 * @returns {boolean} - True if valid
 */
const isValidAcademicYear = (year) => {
  return ACADEMIC_YEARS.includes(year);
};

/**
 * Get the current academic year based on current month
 * Academic year starts in June
 * @returns {string} - Current academic year
 */
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  
  // If current month is June or later, it's the new academic year
  const startYear = month >= 5 ? year : year - 1; // June is month 5
  const endYear = startYear + 4;
  
  return `${startYear}-${endYear}`;
};

/**
 * Student Schema Enum Constants
 */

//alphabetic order
const DEPARTMENTS = [
  "AIDS",
  "AIML",
  "CIVIL",
  "CSE",
  "CSBS",
  "CYS",
  "ECE",
  "EEE",
  "IT",
  "MECH"
];

const SECTIONS = ["A", "B", "C", "D", "E"];

const YEARS = ["I", "II", "III", "IV"];

const ACCOMMODATION_TYPES = ["Hosteller", "Day Scholar"];

const GENDERS = ["Male", "Female", "Other"];

const INTERESTS = [
  "IT",
  "CORE(EEE, ECE, MECH)",
  "Higher Education"
];

module.exports = {
  ACADEMIC_YEARS,
  isValidAcademicYear,
  getCurrentAcademicYear,
  DEPARTMENTS,
  SECTIONS,
  YEARS,
  ACCOMMODATION_TYPES,
  GENDERS,
  INTERESTS,
};
