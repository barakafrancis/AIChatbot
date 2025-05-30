const express = require('express');
const twilio = require('twilio');
const { OpenAI } = require('openai');
require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.urlencoded({ extended: false }));

// OpenAI Config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Or replace with your actual API key string (but env is safer)
});

// WhatsApp Webhook Route
app.post('/app', async (req, res) => {
  console.log('Incoming webhook:', req.body);

  const twiml = new twilio.twiml.MessagingResponse();
  const incomingMsg = req.body.Body;

  if (incomingMsg) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: incomingMsg }],
        model: 'gpt-3.5-turbo',
      });

      const aiReply = completion.choices[0].message.content;

      twiml.message(aiReply);
      res.type('text/xml').send(twiml.toString());
    } catch (error) {
      console.error('OpenAI error:', error);
      twiml.message("Sorry — something went wrong while talking to my AI brain. Try again later!");
      res.type('text/xml').send(twiml.toString());
    }
  } else {
    res.sendStatus(200);
  }
});

// 👉 Health check route (proxy to httpstat.us/200)
app.get('/health', async (req, res) => {
  try {
    const response = await axios.get('https://httpstat.us/200');
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).send('Health check failed');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI WhatsApp bot running on port ${PORT}`);
});
