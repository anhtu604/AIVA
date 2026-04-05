const { createOpenAI } = require('@ai-sdk/openai');
const { streamText } = require('ai');

const openai = createOpenAI({
  apiKey: 'sk-fake',
});

async function main() {
  const result = await streamText({
    model: openai('gpt-4o'), // It won't call it if we don't start the stream
    messages: [{ role: 'user', content: 'hi' }],
  });
  console.log("Result keys:", Object.keys(result));
  console.log("toDataStreamResponse type:", typeof result.toDataStreamResponse);
}
main();
