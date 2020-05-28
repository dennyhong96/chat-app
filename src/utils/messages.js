const generateMessage = (username, text) => ({
  username,
  text,
  createdAt: new Date().getTime(),
});

const generateLocationMessage = (username, locationUrl) => ({
  username,
  locationUrl,
  createdAt: new Date().getTime(),
});

module.exports = {
  generateMessage,
  generateLocationMessage,
};
