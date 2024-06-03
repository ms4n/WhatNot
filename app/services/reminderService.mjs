import cron from "node-cron";
import { DateTime } from "luxon";
import { sendReminderMessage } from "../utils/whatsappUtils.mjs";
import {
  fetchReminders,
  saveReminder,
  updateReminderStatus,
} from "../../database/db.mjs";
import gemini from "../../config/geminiConfig.mjs";

async function generateReminderAndSave(fromPhoneNumber, message) {
  try {
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

    const geminiResult = await gemini.generateContent(prompt);
    const geminiResponseText = await geminiResult.response.text();

    const reminderJsonObject = JSON.parse(geminiResponseText);

    // Add the reminder to db
    const reminder = await saveReminder(
      fromPhoneNumber,
      reminderJsonObject.reminder_time,
      reminderJsonObject.reminder_text
    );

    return reminder.statusCode;
  } catch (error) {
    console.error("Error generating and saving reminder:", error.message);
    throw error;
  }
}

async function checkRemindersAndSend() {
  cron.schedule("*/3 * * * *", async () => {
    try {
      console.log("Running a task every 3 minutes");

      const currentTime = DateTime.now().setZone("Asia/Calcutta");
      const reminderCheckTime = currentTime.plus({ minutes: 5 });

      const reminders = await fetchReminders(
        currentTime.toISO(),
        reminderCheckTime.toISO()
      );

      if (!reminders || reminders.length === 0) {
        console.log("No reminders found for the next 5 minutes.");
        return; // Exit early if there are no reminders
      }

      for (const reminder of reminders) {
        await sendReminderMessage(
          reminder.phone_number,
          reminder.reminder_text
        );
        await updateReminderStatus(reminder.id, "sent");
      }
    } catch (error) {
      console.error("Error in checkRemindersAndSend cron job:", error.message);
    }
  });
}

export { generateReminderAndSave, checkRemindersAndSend };
