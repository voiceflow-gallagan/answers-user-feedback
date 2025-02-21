import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'

dotenv.config()

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Enable CORS for local development
app.use(cors())

app.use(express.json())
app.use(express.static('public'))
app.use(express.static('.'))

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

// Feedback API endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const { userID, user, system, score, projectID } = req.body

    if (!projectID) {
      return res.status(400).json({ error: 'Project ID is required' })
    }

    // Get transcript ID
    const transcriptsResponse = await fetch(
      `https://api.voiceflow.com/v2/transcripts/${projectID}?range=Today`,
      {
        headers: {
          Authorization: process.env.VF_API_KEY,
        },
      }
    )

    const transcripts = await transcriptsResponse.json()
    const transcript = transcripts.find((t) => t.sessionID === userID)

    if (!transcript) {
      return res.status(404).json({ error: 'Transcript not found' })
    }

    // Fetch existing transcript data
    const transcriptDataResponse = await fetch(
      `https://api.voiceflow.com/v2/transcripts/${projectID}/${transcript._id}/data`,
      {
        headers: {
          Authorization: process.env.VF_API_KEY,
        },
      }
    )

    if (!transcriptDataResponse.ok) {
      throw new Error('Failed to fetch transcript data')
    }

    const transcriptData = await transcriptDataResponse.json()

    // Parse existing feedback or initialize empty array
    let existingFeedback = []
    if (transcriptData.customProperties?.feedback) {
      try {
        existingFeedback = JSON.parse(transcriptData.customProperties.feedback)
      } catch (e) {
        console.warn('Failed to parse existing feedback, starting fresh:', e)
      }
    }

    // Add new feedback to array
    const newFeedback = {
      submittedAt: new Date().toISOString(),
      score: score || 0,
      user,
      system,
    }
    existingFeedback.push(newFeedback)

    // Update transcript with combined feedback
    const updateResponse = await fetch(
      `https://api.voiceflow.com/v2/transcripts/${projectID}/${transcript._id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: process.env.VF_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            customProperties: {
              userName: transcriptData.user?.name || 'Demo User',
              feedback: JSON.stringify(existingFeedback),
            },
            sessionID: userID,
          },
        }),
      }
    )

    if (!updateResponse.ok) {
      throw new Error('Failed to update transcript')
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error handling feedback:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Endpoint to fetch transcripts
app.get('/api/transcripts', async (req, res) => {
  try {
    const range = req.query.range || 'Today'
    const projectID = req.query.projectID

    if (!projectID) {
      return res.status(400).json({ error: 'Project ID is required' })
    }

    // Validate range parameter
    const validRanges = [
      'Today',
      'Yesterday',
      'Last 7 Days',
      'Last 30 days',
      'All time',
    ]
    if (!validRanges.includes(range)) {
      return res.status(400).json({ error: 'Invalid range parameter' })
    }

    const response = await fetch(
      `https://api.voiceflow.com/v2/transcripts/${projectID}?range=${range}`,
      {
        headers: {
          Authorization: process.env.VF_API_KEY,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Voiceflow API')
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to fetch transcripts' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
