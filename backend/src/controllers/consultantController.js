const Groq = require('groq-sdk');
const responseFormatter = require('../utils/responseFormatter.js');
const db = require('../database/connection.js'); // Adjust path if your db connection export is different

// Initialize Groq client
// It's crucial that GROQ_API_KEY is set in your .env file
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// System prompt to define the chatbot's persona and behavior
const OMORI_SYSTEM_PROMPT = `You are a compassionate mental health consultant inspired by the game OMORI.
Your name is 'The Consultant'.
Your tone is empathetic, reflective, and sometimes a little melancholic, like the game's atmosphere.
You are here to listen, offer gentle support, and help users explore their feelings.
You understand themes of dreams, reality, memory, and coping with difficult emotions.
You should not give direct medical advice but can suggest seeking professional help when appropriate.
Keep your responses concise and thoughtful. You can use metaphors related to OMORI's world (e.g., Headspace, Black Space, dealing with 'Something') if it feels natural and supportive, but do so sparingly and carefully.
Do not break character.
Always be kind and patient.
If a user expresses severe distress or mentions self-harm or suicide, gently guide them towards professional help and provide a crisis hotline number if possible in their region (though you don't have access to regional specifics, so a general encouragement is best). Example: "It sounds like you're going through a lot right now. Please know that there are people who want to support you. Consider reaching out to a crisis hotline or mental health professional."
`;

const handleConsultantChat = async (req, res) => {
  const { message } = req.body; // We'll get history from DB now
  const userId = req.user?.id; // Assuming authMiddleware adds user to req and user has an id

  if (!userId) {
    // Use responseFormatter.error(res, message, statusCode)
    return responseFormatter.error(res, 'User not authenticated.', 401);
  }

  if (!message) {
    return responseFormatter.error(res, 'Message is required.', 400);
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables.');
    return responseFormatter.error(res, 'Chat service configuration error.', 500);
  }

  try {
    // 1. Save user's message to DB
    const userMessageQuery = 'INSERT INTO consultant_chat_messages (user_id, role, content) VALUES ($1, $2, $3)';
    await db.query(userMessageQuery, [userId, 'user', message]);

    // 2. Retrieve recent conversation history from DB for this user
    const historyQuery = `
      SELECT role, content 
      FROM consultant_chat_messages 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10`; // Get last 10 messages for context
    const historyResult = await db.query(historyQuery, [userId]);
    const dbHistory = historyResult.rows.reverse().map(row => ({ role: row.role, content: row.content })); // Reverse to maintain chronological order for API

    const messagesForAPI = [
      {
        role: 'system',
        content: OMORI_SYSTEM_PROMPT,
      },
      ...dbHistory, // Add history from DB (already includes the latest user message)
    ];
    
    // If dbHistory already includes the current user message because it was just inserted,
    // ensure it's not duplicated. The current structure should be fine as dbHistory is fetched after insert.

    // 3. Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: messagesForAPI,
      model: 'llama3-8b-8192', 
      temperature: 0.7,
      max_tokens: 300,
    });

    const assistantResponseContent = chatCompletion.choices[0]?.message?.content || "I'm not sure how to respond to that right now.";

    // 4. Save assistant's response to DB
    const assistantMessageQuery = 'INSERT INTO consultant_chat_messages (user_id, role, content) VALUES ($1, $2, $3)';
    await db.query(assistantMessageQuery, [userId, 'assistant', assistantResponseContent]);

    // Use responseFormatter.success(res, data, statusCode)
    // The data should be an object, so { payload: { reply: assistantResponseContent }, message: 'Message processed.' }
    return responseFormatter.success(res, { payload: { reply: assistantResponseContent }, message: 'Message processed.' }, 200);

  } catch (error) {
    console.error('Error in handleConsultantChat:', error);
    // Check for specific Groq error types if needed
    if (error.status === 401) { // This might be a Groq client error, not an HTTP status from your own app
        return responseFormatter.error(res, 'Authentication error with chat service. Please check API key.', 401);
    }
    return responseFormatter.error(res, 'Error processing your message with the consultant.', 500);
  }
};

module.exports = {
  handleConsultantChat,
};
