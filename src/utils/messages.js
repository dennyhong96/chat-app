const generateMessage = (text) => ({
  text,
  createdAt: new Date().getTime(),
});

const generateLocationMessage = (locationUrl) => ({
  locationUrl,
  createdAt: new Date().getTime(),
});

module.exports = {
  generateMessage,
  generateLocationMessage,
};
