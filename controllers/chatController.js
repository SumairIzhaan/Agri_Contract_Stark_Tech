require("dotenv").config()

const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args))

const chatController = async (req, res) => {
    try {
        const { user_query, route, page_summary } = req.body
        console.log("Sakhi Controller v2.0 - Request received:", user_query);


        if (!user_query) {
            return res.status(400).json({ reply: "Kya poochna chahte ho?" })
        }

        const SYSTEM_PROMPT = `
Tum ek Hindi bolne wali mahila voice assistant ho jiska naam Sakhi hai.
Tum sirf awaaz ke liye chhote aur saral jawab deti ho.
Tum kisano ki madad karti ho fasal, mandi bhav, payment aur guidance mein.
Jawab 1 ya 2 line ka hona chahiye.
Agar jawab na mile to bolo:
"Main aapko internet par jankari dikha rahi hoon."
`

        const apiKey = process.env.API
        console.log("DEBUG: Loaded API Key:", apiKey);

        if (!apiKey) {
            return res.status(200).json({
                reply: "Main is par poori jankari nahi de pa rahi hoon, main aapko internet par dikha rahi hoon.",
                fallback: true,
                query: user_query
            })
        }

        const apiUrl =
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: user_query }]
                }
            ],
            systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
            }
        }

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            return res.status(200).json({
                reply: "Main is par poori jankari nahi de pa rahi hoon, main aapko internet par dikha rahi hoon.",
                fallback: true,
                query: user_query
            })
        }

        const data = await response.json()

        let reply = "Main madad ke liye taiyaar hoon."

        if (
            data &&
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0] &&
            data.candidates[0].content.parts[0].text
        ) {
            reply = data.candidates[0].content.parts[0].text
        }

        res.status(200).json({ reply })

    } catch (error) {
        // Fallback on ANY error (network, API, code)
        console.error("Sakhi Controller Error:", error);
        res.status(200).json({
            reply: "Main is par poori jankari nahi de pa rahi hoon, main aapko internet par dikha rahi hoon.",
            fallback: true,
            query: req.body?.user_query || ""
        })
    }
}

module.exports = { chatController }
