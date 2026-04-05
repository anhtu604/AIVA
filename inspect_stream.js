const { streamText } = require('ai');

async function main() {
  const result = await streamText({
    model: {
      doGenerate: async () => ({
        text: 'Hello',
        finishReason: 'stop',
        usage: { promptTokens: 0, completionTokens: 0 },
      }),
      doStream: async () => {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue({
              type: 'text-delta',
              textDelta: 'Hello',
            });
            controller.close();
          },
        });
        return {
          stream,
          rawResponse: { headers: {} }
        };
      },
    },
    messages: [{ role: 'user', content: 'hi' }],
  });

  const response = result.toDataStreamResponse();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    process.stdout.write(decoder.decode(value));
  }
}
main();
