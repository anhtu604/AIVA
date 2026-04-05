const { createOpenAI } = require('@ai-sdk/openai');
const { streamText } = require('ai');

const customOpenAI = createOpenAI({
  baseURL: 'https://llm.chiasegpu.vn/v1',
  apiKey: 'sk-694f5fe48b5ac1f00eb9bc62c55d02c0f5d5ca1322e5044675aac9d7cf3f9a22',
  fetch: async (url, options) => {
    const response = await fetch(url, options);
    // Force content-type to text/event-stream to bypass OpenAI provider validation
    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/event-stream');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }
});

async function main() {
  try {
    const result = await streamText({
      model: customOpenAI('gemma-4-31b-it'),
      system: 'You are AIVA Care',
      messages: [{ role: 'user', content: 'hi' }],
    });

    const response = result.toDataStreamResponse();
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(decoder.decode(value));
    }
  } catch (e) {
    console.error("FAILED", e);
  }
}
main();
