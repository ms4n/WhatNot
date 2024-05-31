import cron from "node-cron";
import { DateTime } from "luxon";
import { sendReminderMessage } from "../utils/whatsappUtils.mjs";
import { saveReminder } from "../../database/db.mjs";
import gemini from "../../config/geminiConfig.mjs";

async function generateReminderAndSave(fromPhoneNumber, message) {
  //extract time (ISO string) and reminderText from the message using LLM
  const now = DateTime.now().setZone("Asia/Calcutta");
  const currentDateTimeISO = now.toISO();
  const dayOfWeek = now.toLocaleString(DateTime.DATE_HUGE);

  const prompt = `
    Today's current date and time: ${currentDateTimeISO}
    Today's day of the week: ${dayOfWeek}

    User Message: ${message}

    Instructions: Given a message that starts with "/rem", extract the reminder text (what the reminder is about) and the reminder time (when the reminder should be sent). The reminder time should be converted to an ISO 8601 string format.

    * Do not format the result as JSON, just output string, strictly avoid trailing comma."

    The output should be in JSON format as follows:

    { 
      "reminder_text": "",
      "reminder_time": ""
    }

    If the time is not explicitly specified, return a default reminder time of 24 hours from now.

    If the date is not mentioned explicitly, consider it today, and if today's time has passed compared to the reminder's time, set it to tomorrow. Always ensure the reminder date is in the future.

    `;

  //add the reminder to db

  //set a cron job which queries db and sends reminder - preferably 5 minutes before the reminder time
  //mark the send reminder status to sent

  const geminiResult = await gemini.generateContent(prompt);
  const geminiResponseText = geminiResult.response.text();

  const reminderJsonObject = JSON.parse(geminiResponseText);

  // return reminderJsonObject;

  const reminder = await saveReminder(
    fromPhoneNumber,
    reminderJsonObject.reminder_time,
    reminderJsonObject.reminder_text
  );

  return reminder.statusCode;
}

// await reminderService("/rem remind me to buy groceries and chicken at 6pm");

export { generateReminderAndSave };
