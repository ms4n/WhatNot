import messageController from "./messageController.mjs";

async function processMessage(body) {
  if (
    body.object &&
    body.entry &&
    body.entry[0].changes &&
    body.entry[0].changes[0].value.messages &&
    body.entry[0].changes[0].value.messages[0]
  ) {
    const messageObject = body.entry[0].changes[0].value.messages[0];

    await messageController.handleIncomingMessage(messageObject);
  }
}

export default { processMessage };
