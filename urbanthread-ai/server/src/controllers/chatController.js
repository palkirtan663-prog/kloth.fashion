const Product = require('../models/Product');
const { getChatReply } = require('../services/aiChatService');

const MAX_MESSAGE_CHARS = 500;

async function chat(req, res) {
  const message = typeof (req.body || {}).message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'Tell me what you are looking for.' });
  if (message.length > MAX_MESSAGE_CHARS) {
    return res.status(400).json({ error: `Please keep your message under ${MAX_MESSAGE_CHARS} characters.` });
  }

  // Recommendations come only from products that really exist in MongoDB.
  const docs = await Product.find().sort({ createdAt: 1, _id: 1 });
  const products = docs.map((d) => d.toJSON());

  const result = await getChatReply({ message, products, ai: req.app.locals.config.ai });
  res.json({ reply: result.reply, mode: result.mode, productIds: result.productIds || [] });
}

module.exports = { chat };
