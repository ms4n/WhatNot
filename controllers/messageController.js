function getResponseMessage(message) {
  if (message.toLowerCase().includes("hello")) {
    return "Hello! How can I assist you?";
  } else if (message.toLowerCase().includes("goodbye")) {
    return "Goodbye! Have a great day!";
  } else {
    return "Thank you for your message!";
  }
}

module.exports = { getResponseMessage };
