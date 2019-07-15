const { getUserbyNameRoom } = require("./users");

const isRealString = str => {
  return typeof str === "string" && str.trim().length > 0;
};

const isPrivate = ({ text, room }) => {
  if (text.charAt(0) !== "@") {
    return false;
  }

  var targetName = "";
  var realMessage = "";

  for (var i = 1; i < text.length; i++) {
    if (text.charAt(i) === " ") {
      break;
    }
    targetName += text.charAt(i);
  }
  var start_i = i;
  for (var i = start_i; i < text.length; i++) {
    realMessage += text.charAt(i);
  }
  console.log("here using validation");
  // return { targetName, room };
  const aaa = getUserbyNameRoom(targetName, room);
  return aaa;
};

module.exports = { isRealString, isPrivate };
