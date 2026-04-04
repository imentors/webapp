import 'dotenv/config'
import { db } from '../server/utils/drizzle'
import { review } from '../server/db/schema'

async function checkReviewTable() {
    try {
        console.log('Checking if review table exists...')
        const result = await db.select().from(review).limit(1)
        console.log('Success! Review table queried successfully.')
        console.log('Result:', result)
        process.exit(0)
    } catch (error) {
        console.error('Error querying review table:', error)
        process.exit(1)
    }
}

checkReviewTable()
