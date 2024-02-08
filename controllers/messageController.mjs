const RESPONSE_MESSAGES = {
  HELLO: "Hello! How can I assist you?",
  GOODBYE: "Goodbye! Have a great day!",
  DEFAULT: "Thank you for your message!",
  WELCOME_LINK:
    "Hello! Welcome to Whatnot! To get started, please sign up here: https://whatnotapp.vercel.app/signup. We're excited to have you on board!",
};

function getResponseMessage(message) {
  const lowerCaseMessage = message.toLowerCase();

  if (lowerCaseMessage.includes("Hello! 👋")) {
    return RESPONSE_MESSAGES.WELCOME_LINK;
  } else if (lowerCaseMessage.includes("goodbye")) {
    return RESPONSE_MESSAGES.GOODBYE;
  } else {
    return RESPONSE_MESSAGES.DEFAULT;
  }
}

export default { getResponseMessage };
