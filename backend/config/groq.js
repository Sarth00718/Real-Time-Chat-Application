import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY 
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

if (!groq) {
    console.warn('⚠️  GROQ_API_KEY not configured. AI features will be disabled.');
}

export default groq;
