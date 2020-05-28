const users = [];

// add user
const addUser = ({ id, username, room }) => {
  // clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  // validate data
  if (!username || !room) {
    return {
      error: "Username and room fields are required.",
    };
  }
  // check for existing username in same room
  const existingUser = users.find(
    (user) => user.username === username && user.room === room
  );
  if (existingUser) {
    return {
      error: "Username is already taken.",
    };
  }
  // store new user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// remove user by id
const removeUser = (id) => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    // array.splice returns an array containing spliced off items
    return users.splice(userIndex, 1)[0];
  }
};

// get user
const getUser = (id) => {
  return (user = users.find((user) => user.id === id));
};

// get users in room
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return (roomUsers = users.filter((user) => user.room === room));
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
