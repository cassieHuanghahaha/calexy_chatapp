const users = [];

// addUser, removeUser, getUser, getUsersInRoom
const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  var title = room.split("-");
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  var month_index = parseInt(title[1], 10) - 1;
  var month = months[month_index];
  room = month.concat("-", title[2]).toLowerCase();

  // validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!"
    };
  }
  // check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // validate username
  if (existingUser) {
    return {
      error: "Username is in use!"
    };
  }
  // store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);
  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

const getUserByNameRoom = ({ name, room }) => {
  // console.log(name, room);
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();
  return users.filter(user => user.username === name && user.room === room)[0];
};

const isRealString = str => {
  return typeof str === "string" && str.trim().length > 0;
};

const getPrivateVal = ({ text, room }) => {
  // console.log(text);
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
  // console.log("here using validation");
  return { targetName, room, realMessage };
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getUserByNameRoom,
  isRealString,
  getPrivateVal
};

// testing
// addUser({
//   id: 22,
//   username: "cAss ",
//   room: "123"
// });
// addUser({
//   id: 42,
//   username: "mike ",
//   room: "123"
// });
// addUser({
//   id: 32,
//   username: "cass ",
//   room: "center city"
// });

// const user = getUser(42);
// console.log(user);

// const userList = getUsersInRoom("hole");
// console.log(userList);
