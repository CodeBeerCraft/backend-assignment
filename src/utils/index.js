const moment = require('moment');
const responseSkeleton = () => {
  return {
    success: false,
    error: false,
    message: '',
    data: [],
  };
};

/**
 * Custom escape function to prevent SQL injection.
 * @param {string} input  The string which needs to be escaped.
 * @returns the escaped string.
 */
const escape = (input) => {
  // Define a regular expression pattern to match allowed characters
  const escapedPattern = /^[a-zA-Z0-9_,-]+$/;
  let result;
  // Test if the input string matches the allowed pattern
  if (escapedPattern.test(input)) {
    // If it matches, return the original string
    result = 'string' == typeof input ? input.trim() : input;
  } else {
    // If it doesn't match, escape the string by replacing disallowed characters with an empty string
    switch (typeof input) {
      case 'number':
        result = input.replace(escapedPattern, '');
        break;
      case 'string':
        result = input.replace(escapedPattern, '').trim();
        break;
      case 'undefined':
        result = '';
        break;
    }
  }

  return result;
};

function isValidDate(dateString, format = 'YYYY-MM-DD') {
  console.log(dateString);

  return moment(dateString, format, true).isValid(); // Strict parsing with format
}

module.exports = {
  responseSkeleton,
  escape,
  isValidDate,
};
