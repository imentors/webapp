
import { google } from 'googleapis'
import 'dotenv/config'

const GOOGLE_CLIENT_EMAIL = process.env.NUXT_GOOGLE_CLIENT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.NUXT_GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
const GOOGLE_CALENDAR_ID = process.env.NUXT_GOOGLE_CALENDAR_ID || 'primary'

async function checkSolutions() {
    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        console.error('Missing credentials')
        return
    }

    const auth = new google.auth.JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    try {
        console.log('Checking calendar:', GOOGLE_CALENDAR_ID)
        const res = await calendar.calendars.get({ calendarId: GOOGLE_CALENDAR_ID })
        console.log('Calendar found:', res.data.summary)
        console.log('Conference Properties:', res.data.conferenceProperties)
    } catch (e) {
        console.error('Error fetching calendar:', e.message)
    }
}

checkSolutions()
