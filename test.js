const { createOpenAI } = require('@ai-sdk/openai');
const { streamText } = require('ai');
const fs = require('fs');

const p = createOpenAI({
  baseURL: 'https://llm.chiasegpu.vn/v1',
  apiKey: 'sk-694f5fe48b5ac1f00eb9bc62c55d02c0f5d5ca1322e5044675aac9d7cf3f9a22'
});

async function main() {
  try {
    const r = await streamText({
      model: p('gemma-4-31b-it'),
      system: 'hi',
      messages: [{role:'user',content:'yo'}]
    });
    const text = await r.text;
    console.log("Success", text);
  } catch (e) {
    fs.writeFileSync('error.log', JSON.stringify({
      message: e.message,
      url: e.url,
      cause: e.cause ? e.cause.message : null,
      responseBody: e.responseBody
    }, null, 2));
  }
}
main();
