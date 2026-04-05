const { createOpenAI } = require('@ai-sdk/openai');
const { streamText } = require('ai');

const openai = createOpenAI({ apiKey: 'fake' });

const result = streamText({
  model: openai('gpt-4o'),
  messages: [{ role: 'user', content: 'hi' }],
});

console.log("Proto keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(result)));
console.log("Instance keys:", Object.keys(result));
