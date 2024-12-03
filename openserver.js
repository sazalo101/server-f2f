// server.js
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/subtopics', async (req, res) => {
  try {
    const { subject } = req.body;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `Generate 5 subtopics for ${subject}` }],
      max_tokens: 200
    });
    res.json({ subtopics: response.choices[0].message.content.trim().split('\n') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lesson', async (req, res) => {
  try {
    const { subject, subtopic, mode } = req.body;
    let prompt;
    
    if (mode === 'regular') {
      prompt = `Create a comprehensive lesson on ${subtopic} in ${subject}. Include:
        1. Introduction (4 sentences)
        2. Main Content (10 points with 2-3 sentences each ,if its programming include codes)
        3. Important Notes (5 key points)
        4. Examples (3 relevant examples)
        5. Summary (3 sentences)
        6. Quiz (5 questions with A,B,C,D answers)`;
    } else if (mode === 'kids') {
      prompt = `Create a kid-friendly lesson on ${subtopic} with:
        1. Simple explanation (2-3 sentences)
        2. Fun activity idea
        3. Interesting fact
        Use emoji and simple language!`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000
    });

    let imageUrl = '';
    if (mode === 'kids') {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Fun, colorful, kid-friendly illustration of ${subtopic}`,
        size: "1024x1024",
        n: 1,
      });
      imageUrl = imageResponse.data[0].url;
    }

    res.json({ 
      lesson: response.choices[0].message.content.trim(),
      image: imageUrl 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/story', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `
        Create a fun 200-word children's story with:
        1. Magical adventure
        2. Two characters (one magical)
        3. Moral lesson
        4. Colorful descriptions
      ` }],
      max_tokens: 1000
    });
    
    res.json({ story: response.choices[0].message.content.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post('/api/generate-lesson', async (req, res) => {
    try {
      const { title, targetAge, subject, objectives } = req.body;
      
      const prompt = `Create a detailed lesson plan for:
        Title: ${title}
        Target Age/Grade: ${targetAge}
        Subject: ${subject}
        Learning Objectives:
        ${objectives}
  
        Please include:
        1. Introduction
        2. Main Learning Activities
        3. Assessment Methods
        4. Materials Needed
        5. Extended Learning Opportunities
        6. Differentiation Strategies
        7. Success Criteria`;
  
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000
      });
  
      res.json({ lesson: response.choices[0].message.content.trim() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

const PORT = process.env.PORT || 5000;
const hostname = '0.0.0.0';
app.listen(PORT,hostname,() => console.log(`Server running on port ${hostname}, ${PORT}`));