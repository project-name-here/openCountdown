/**
 * Converts a string into a boolean
 * @param {String} stringBoolean 
 * @returns Boolean if valid or -1 otherwise
 */
function convertStringBooleanToBoolean(stringBoolean) {
  if (stringBoolean === 'true') {
    return true;
  } else if(stringBoolean === 'false') {
    return false;
  } else {
      return(-1)
  }
}

/**
 * Wraps convertStringBooleanToBoolean to be used with express. Will respond with an error if the boolean is invalid. Else dataObj will be set to the converted boolean value.
 * @param {String} stringBoolean An input string given by the user
 * @param {*} res Expresses response object
 * @param {*} dataObj The data to manipulate
 */

function wrapBooleanConverter(stringBoolean, res) {
  const temp = convertStringBooleanToBoolean(stringBoolean);
  if(temp == -1) {
    res.json({ status: "error", message: "Invalid boolean value" });
  } else {
    return(temp);
  }
}

module.exports = { convertStringBooleanToBoolean, wrapBooleanConverter };