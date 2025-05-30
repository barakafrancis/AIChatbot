const express = require('express');
const twilio = require('twilio');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// 👉 Health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI WhatsApp bot running on port ${PORT}`);
});
