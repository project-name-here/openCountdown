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

/**
 * Tries to parse a string to a JSON object. Returns false if invalid. Taken from https://stackoverflow.com/a/20392392/11317151
 * @param {String} jsonString A JSON String to parse
 * @returns {Object/Boolean} JSON Object if valid or false otherwise
 */
function tryToParseJson(jsonString) {
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object", 
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) { }

    return false;
}


module.exports = { convertStringBooleanToBoolean, wrapBooleanConverter, tryToParseJson };