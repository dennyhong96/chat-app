const socket = io(); // function from socketio client side script

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageInput = $messageForm.querySelector("input");
const $messageButton = $messageForm.querySelector("button");
const $geoLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates: innerHTML of the script tags
const messageTemplate = document.querySelector("#message-template").innerHTML;
const geoTemplate = document.querySelector("#location-message-template")
  .innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options: from Qs library inclued in chat.html
// location.serach give us the querystring from form submition
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
}); // ignores the "?"

// scroll down as new messages come if user current at scroll bottom
const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMsgStyles = getComputedStyle($newMessage);
  const newMsgMargin = parseInt(newMsgStyles.marginBottom);
  const newMsgHeight = $newMessage.offsetHeight + newMsgMargin; // offsetHeight doesn't take into account the margin

  // Messages section **visible** height
  const visibleHeight = $messages.offsetHeight;

  // Messages **container** height
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  // scrollTop gives the distance from top to scrollbar
  // scrollbar's own height is the visible height
  const scrollOffset = $messages.scrollTop + visibleHeight;

  // check if we are at the bottom before the new message added
  if (containerHeight - newMsgHeight <= scrollOffset) {
    // scroll all the way to bottom
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const { username: userDisplay, text, createdAt } = message;
  // mustache template library
  const html = Mustache.render(messageTemplate, {
    userDisplay,
    createdAt: moment(createdAt).format("h:mm a"),
    message: text,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (location) => {
  console.log(location);
  const { username, locationUrl, createdAt } = location;
  const html = Mustache.render(geoTemplate, {
    username,
    locationUrl,
    createdAt: moment(createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  $messageButton.setAttribute("disabled", "disabled");
  const clientMsg = $messageInput.value; // because we set up name attr on input inside form
  socket.emit("sendMessage", clientMsg, (errorMsg) => {
    // ux optimization
    $messageButton.removeAttribute("disabled");
    $messageInput.value = "";
    $messageInput.focus();
    if (errorMsg) {
      return console.log(errorMsg);
    }
    return console.log("Message delivered!");
  });
});

$geoLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    // if user's browser does not support geolocation
    return alert("Geolocation is not supported by your browser!");
  }
  $geoLocationButton.setAttribute("disabled", "disabled");
  // geolocatoin async operation, use callback only
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { latitude, longitude }, () => {
      console.log("Location shared!");
      $geoLocationButton.removeAttribute("disabled");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/"; // redirect back to sign in page
  }
});
