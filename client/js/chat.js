const socket = io();
//.on listen for message
// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $locationSendButton = document.querySelector("#send-location");
const $someoneSendButton = document.querySelector("#send-to-someone");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have i scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", message => {
  // console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("hh:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("updateMessage", randomUser => {
  // console.log(randomUser);
  const messageUpdates = "@";
  $messageFormInput.value = messageUpdates.concat(randomUser.username);
  $messageFormInput.focus();
});

socket.on("locationMessage", message => {
  // console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("hh:mm a") //calendar() //
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.msg.value;
  if (message.charAt(0) === "@") {
    socket.emit("createMessage", message, error => {
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      $messageFormInput.focus();

      if (error) {
        return console.log(error);
      }
      console.log("Message delivered!");
    });
  } else {
    socket.emit("sendMessage", message, error => {
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      $messageFormInput.focus();

      if (error) {
        return console.log(error);
      }
      console.log("Message delivered!");
    });
  }
});

// $messageForm.addEventListener("submit", e => {
//   e.preventDefault();
//   $messageFormButton.setAttribute("disabled", "disabled");

//   const message = e.target.elements.msg.value;
//   socket.emit("createMessage", message, error => {
//     $messageFormButton.removeAttribute("disabled");
//     $messageFormInput.value = "";
//     $messageFormInput.focus();

//     if (error) {
//       return console.log(error);
//     }
//     console.log("createMessage delivered!");
//   });
// });

$locationSendButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }
  // disable
  $locationSendButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        //enable
        $locationSendButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

$someoneSendButton.addEventListener("click", () => {
  // disable
  $someoneSendButton.setAttribute("disabled", "disabled");

  socket.emit("findSomeone", error => {
    //enable
    if (error) {
      return alert(error);
    }
    $someoneSendButton.removeAttribute("disabled");
    console.log("Send to a random user!");
    // console.log(randomUser);
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
