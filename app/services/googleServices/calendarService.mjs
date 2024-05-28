import { DateTime } from "luxon";
import { getCalendarService } from "../../../config/googleApiConfig.mjs";
import gemini from "../../../config/geminiConfig.mjs";

let calendarService;

async function initializeCalendarService(phoneNumber) {
  try {
    calendarService = await getCalendarService(phoneNumber);
  } catch (err) {
    console.error("Error initializing Calendar service:", err);
    throw err;
  }
}

async function generateCalendarEventFromMessage(message) {
  const now = DateTime.utc();
  const currentDateTimeISO = now.toISO();
  const dayOfWeek = now.toLocaleString(DateTime.DATE_HUGE);

  const prompt = `
    Today's date and time: ${currentDateTimeISO} 
    Today's day of the week: ${dayOfWeek}
  
    User Message: ${message}
  
    Instructions: Extract the following information from the user message and generate a JSON object in the specified format:
    
    * summary: A concise title for the event.
    * description: A meaningful description of the meeting's purpose (if available).
    * start: The date and time the meeting starts.
    * end: The date and time the meeting ends (assume a default duration of 1 hour if not explicitly mentioned).
    * Both the end and start time must be in ISO format without 'Z' timezone (e.g., 2024-04-15T15:00:00)
    * Do not format the result as JSON, just output string, strictly avoid trailing comma."
    
    JSON Format:
    {
      "summary":"",
      "description":"",
      "start":{
         "dateTime":""
      },
      "end":{
         "dateTime":""
      }
   }`;

  const geminiResult = await gemini.generateContent(prompt);
  const geminiResponseText = geminiResult.response.text();

  const calendarJsonObject = JSON.parse(geminiResponseText);
  return calendarJsonObject;
}

function generateEventLink(calendarObject, meetLink) {
  // format date-time to the required ISO 8601 format (without dashes, colons, and milliseconds)
  function formatDateTime(dateTime) {
    return dateTime.replace(/-|:|\.\d+/g, "").slice(0, 15);
  }

  const startDateTime = formatDateTime(calendarObject.start.dateTime);
  const endDateTime = formatDateTime(calendarObject.end.dateTime);

  // URL encode the title, description
  const title = encodeURIComponent(calendarObject.summary);
  const description = encodeURIComponent(
    `${
      calendarObject.description ? calendarObject.description : ""
    }\n\nGoogle Meet link: ${meetLink}`
  );

  // Extract time zones
  const startTZ = calendarObject.start.timeZone;
  const endTZ = calendarObject.end.timeZone;

  // Construct the Google Calendar link
  const baseURL = "https://calendar.google.com/calendar/r/eventedit";
  const link = `${baseURL}?action=TEMPLATE&dates=${startDateTime}%2F${endDateTime}&stz=${startTZ}&etz=${endTZ}&details=${description}&text=${title}`;

  return link;
}

async function createCalendarEvent(message) {
  const event = await generateCalendarEventFromMessage(message);

  event.start.timeZone = "Asia/Calcutta";
  event.end.timeZone = "Asia/Calcutta";

  event.conferenceData = {
    createRequest: {
      requestId: "whatnot",
      conferenceSolutionKey: {
        type: "hangoutsMeet",
      },
    },
  };

  try {
    const calEvent = await calendarService.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });

    let eventLink = null;

    if (calEvent.status === 200) {
      eventLink = generateEventLink(
        event,
        calEvent.data.conferenceData.entryPoints[0].uri
      );
    }

    return { status: calEvent.status, eventLink };
  } catch (error) {
    console.error("Error creating event on Google Calendar:", error);
    throw error; // rethrow the error to be handled by the caller
  }
}

export { initializeCalendarService, createCalendarEvent };
