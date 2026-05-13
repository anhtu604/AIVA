require('dotenv').config();
const express = require('express');
const axios = require('axios');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PROXY_PORT || 20129;
const TARGET_URL = process.env.UPSTREAM_BASE_URL || 'http://127.0.0.1:20128';

app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', proxy: 'active', target: TARGET_URL });
});

// Pass through /v1/models
app.get('/v1/models', async (req, res) => {
    try {
        const response = await axios.get(`${TARGET_URL}/v1/models`, {
            headers: { 'Authorization': req.headers.authorization || '' },
            timeout: 15000
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error fetching models:', error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch models' });
    }
});

// Intercept /v1/chat/completions
app.post('/v1/chat/completions', async (req, res) => {
    try {
        const payload = { ...req.body };
        const isStreamingRequested = payload.stream === true;
        
        // If stream is false or undefined, explicitly ensure it is false for 9router
        if (!isStreamingRequested) {
            payload.stream = false;
        }

        console.log(`[Proxy] Forwarding to 9router. Model: ${payload.model}, Stream: ${payload.stream}`);

        if (isStreamingRequested) {
            // Streaming mode: pipe SSE directly to Dify
            const response = await axios.post(`${TARGET_URL}/v1/chat/completions`, payload, {
                headers: {
                    'Authorization': req.headers.authorization || '',
                    'Content-Type': 'application/json'
                },
                responseType: 'stream',
                validateStatus: () => true
            });
            
            // Set standard SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.status(response.status);
            
            response.data.pipe(res);
        } else {
            // Non-streaming mode: await full response
            const response = await axios.post(`${TARGET_URL}/v1/chat/completions`, payload, {
                headers: {
                    'Authorization': req.headers.authorization || '',
                    'Content-Type': 'application/json'
                },
                timeout: 120000,
                validateStatus: () => true
            });

            let responseData = response.data;

            // Failsafe: if 9router STILL returns SSE despite stream=false, buffer and parse it
            if (typeof responseData === 'string' && (responseData.includes('data:') || responseData.includes('"chat.completion.chunk"'))) {
                console.log('🔄 9router forced SSE. Aggregating into JSON...');
                
                let fullContent = '';
                let finishReason = 'stop';
                
                const contentRegex = /"content"\s*:\s*("(?:[^"\\]|\\.)*")/g;
                let match;
                while ((match = contentRegex.exec(responseData)) !== null) {
                    try {
                        fullContent += JSON.parse(match[1]);
                    } catch(e) {}
                }
                
                if (responseData.includes('"finish_reason":"length"')) {
                    finishReason = 'length';
                }
                
                responseData = {
                    id: `chatcmpl-${Date.now()}`,
                    object: 'chat.completion',
                    created: Math.floor(Date.now() / 1000),
                    model: payload.model || 'unknown',
                    choices: [
                        {
                            index: 0,
                            message: { role: 'assistant', content: fullContent },
                            finish_reason: finishReason
                        }
                    ],
                    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
                };
            }

            res.status(response.status).json(responseData);
        }

    } catch (error) {
        console.error('❌ Proxy Request Error:', error.message);
        res.status(500).json({ error: 'Proxy failed to process request' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Advanced Dify Compatibility Proxy is RUNNING on http://0.0.0.0:${PORT}`);
    console.log(`👉 In Dify, use Base URL: http://host.docker.internal:${PORT}/v1`);
});
