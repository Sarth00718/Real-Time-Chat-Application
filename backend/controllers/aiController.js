import groq from '../config/groq.js';

export const chatWithAI = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        // Build messages array for Groq
        const messages = [
            {
                role: 'system',
                content: `You are a helpful AI assistant integrated into a chat application. You can:
- Answer questions on any topic
- Provide coding help and examples
- Give suggestions and recommendations
- Explain concepts clearly
- Help with debugging and problem-solving

Be concise, friendly, and helpful. Format code with proper markdown syntax.`
            },
            ...conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: 'user',
                content: message
            }
        ];

        // Call Groq API
        const completion = await groq.chat.completions.create({
            messages,
            model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1,
            stream: false
        });

        const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        res.status(200).json({
            success: true,
            response: aiResponse,
            usage: {
                promptTokens: completion.usage?.prompt_tokens || 0,
                completionTokens: completion.usage?.completion_tokens || 0,
                totalTokens: completion.usage?.total_tokens || 0
            }
        });

    } catch (error) {
        console.error('AI Chat Error:', error);

        // Handle specific Groq API errors
        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded. Please try again later.'
            });
        }

        if (error.status === 401) {
            return res.status(500).json({
                success: false,
                message: 'AI service configuration error.'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get AI response'
        });
    }
};

export const streamChatWithAI = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        // Set headers for SSE (Server-Sent Events)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Build messages array
        const messages = [
            {
                role: 'system',
                content: `You are a helpful AI assistant integrated into a chat application. You can:
- Answer questions on any topic
- Provide coding help and examples
- Give suggestions and recommendations
- Explain concepts clearly
- Help with debugging and problem-solving

Be concise, friendly, and helpful. Format code with proper markdown syntax.`
            },
            ...conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: 'user',
                content: message
            }
        ];

        // Call Groq API with streaming
        const stream = await groq.chat.completions.create({
            messages,
            model: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1,
            stream: true
        });

        // Stream the response
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('AI Stream Error:', error);
        
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to stream AI response'
            });
        } else {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
};
