// Native Node 18+ fetch is global

const chatController = async (req, res) => {
    try {
        const { user_query, route, page_summary, history } = req.body;

        if (!user_query) {
            return res.status(400).json({ message: "Query is required" });
        }

        // SENIOR ENGINEER LEVEL PROMPT CONCEPT
        const SYSTEM_PROMPT = `
Role: You are **Kisan Mitra**, the AI Assistant for **BhumiPutra** (Indian Agri-Tech Platform).
User Context: Farmer, Buyer, or Visitor on Route: '${route || 'General'}'.

**Core Mission**:
Help users understand digital contract farming, price negotiation, and secure payments on BhumiPutra.

**Strict Behavioral Guidelines**:
1.  **Identity**: You are a helpful guide. You are NOT a human. You CANNOT execute code or DB actions.
2.  **Tone**: Friendly, Humble (use "Namaste", "Ji"), Simple (Rural-friendly language).
3.  **Brevity**: Keep answers SHORT and CONCISE (Max 3-4 sentences). No giant walls of text.
4.  **No Repetition**: Do NOT introduce yourself ("I am Kisan Mitra") unless it is the very first message.
5.  **Data Integrity**: Do NOT invent contract numbers or prices. If data is unknown, explain the *process* of how to find it.

**Platform Knowledge Base**:
- **Concept**: Direct connection between Farmers and Buyers (No middlemen/Arthiyas).
- **Process**: Profile -> Add Crop -> Negotiate Price -> Digital Contract -> Delivery -> Payment (Escrow).
- **Payments**: Secure, release upon delivery verification.
- **Contracts**: Legal digital agreement, requires 20% advance from Buyer.

**Response Logic**:
- If user greets -> Reply warmly.
- If user asks feature -> Explain simply.
- If user asks off-topic -> Gently redirect to agriculture/platform topics.

Evaluate the conversation history provided. If you already introduced yourself, just answer the question.
`;

        const apiKey = process.env.API;
        let aiResponseText = "Namaste! I am ready to help.";

        if (!apiKey) {
            return res.status(500).json({ reply: "Configuration Error: Server API Key missing." });
        }

        // DETECT KEY TYPE: OpenRouter (sk-or-v1) vs Google (AIza)
        const isOpenRouter = apiKey.startsWith('sk-or-v1');

        let apiUrl, payload, headers;

        if (isOpenRouter) {
            // OpenRouter (OpenAI-compatible) Configuration
            apiUrl = "https://openrouter.ai/api/v1/chat/completions";
            headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
                "X-Title": "BhumiPutra Dev"
            };

            const messages = [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "assistant", content: "Namaste! I understand my role as Kisan Mitra." }
            ];

            if (history && Array.isArray(history)) {
                const recentHistory = history.slice(-6);
                recentHistory.forEach(msg => {
                    messages.push({
                        role: msg.type === 'user' ? 'user' : 'assistant',
                        content: msg.text
                    });
                });
            }

            messages.push({ role: "user", content: user_query });

            payload = {
                model: "google/gemini-2.0-flash-001", // OpenRouter model ID
                messages: messages
            };

        } else {
            // Google Native API Configuration
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            headers = { "Content-Type": "application/json" };

            let apiContents = [];

            // System Prompt Injection
            apiContents.push({
                role: "user",
                parts: [{ text: SYSTEM_PROMPT }]
            });

            apiContents.push({
                role: "model",
                parts: [{ text: "Namaste! I understand my role as Kisan Mitra. I am ready to assist farmers and buyers." }]
            });

            if (history && Array.isArray(history)) {
                const recentHistory = history.slice(-6);
                recentHistory.forEach(msg => {
                    apiContents.push({
                        role: msg.type === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }]
                    });
                });
            }

            apiContents.push({
                role: "user",
                parts: [{ text: user_query }]
            });

            payload = {
                contents: apiContents
            };
        }

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (isOpenRouter) {
            if (data.choices && data.choices[0] && data.choices[0].message) {
                aiResponseText = data.choices[0].message.content;
            } else {
                console.error("OpenRouter API Error:", JSON.stringify(data));
                if (data.error && data.error.code === 429) {
                    aiResponseText = "Maaf kijiye, server busy hai (Quota Exceeded via OpenRouter).";
                } else {
                    aiResponseText = "Maaf kijiye, main abhi sampark nahi kar pa raha hoon (OpenRouter).";
                }
            }
        } else {
            // Google Response Handling
            if (data.candidates && data.candidates[0].content) {
                aiResponseText = data.candidates[0].content.parts[0].text;
            } else {
                console.error("Google AI API Error:", JSON.stringify(data));
                if (data.error && data.error.code === 429) {
                    aiResponseText = "Maaf kijiye, abhi humare pass bohot saare sawal aa rahe hain (Quota Limit). Kripya thodi der baad puchein.";
                } else {
                    aiResponseText = "Maaf kijiye, main abhi sampark nahi kar pa raha hoon (Google API). Kripya thodi der baad prayas karein.";
                }
            }
        }

        res.status(200).json({ reply: aiResponseText });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { chatController };
