const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const authenticate = require('../middleware/authenticate');

const router = Router();

// Destination directory for uploads
const UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images', 'uploads');

// Ensure directory exists
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[upload] Could not create uploads directory:', err.message);
}

// POST /api/upload
// Expects: { image: string (base64 data URI), filename?: string }
router.post('/', authenticate, async (req, res) => {
  try {
    const { image, filename } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data is required (data URL or base64).' });
    }

    // Check if it's already an HTTP URL
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return res.json({ url: image });
    }

    // Match base64 data URI: data:image/png;base64,...
    const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      // If it's a direct relative path like /images/foo.jpg, return it as-is
      if (image.startsWith('/images/')) {
        return res.json({ url: image });
      }
      return res.status(400).json({ error: 'Invalid image format. Expected Base64 data URL or https link.' });
    }

    const ext = matches[1].replace('jpeg', 'jpg');
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Limit buffer size to 10MB
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image file too large. Max size is 10MB.' });
    }

    const cleanName = (filename || 'upload')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .slice(0, 30);
    const uniqueFilename = `${cleanName}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/images/uploads/${uniqueFilename}`;

    res.json({
      url: publicUrl,
      filename: uniqueFilename,
      size: buffer.length,
    });
  } catch (err) {
    console.error('[upload] Error saving upload:', err.message);
    // If disk write fails, fall back to returning the data URI so user's experience is not broken
    if (req.body?.image && req.body.image.startsWith('data:image/')) {
      return res.json({ url: req.body.image, fallback: true });
    }
    res.status(500).json({ error: 'Failed to process uploaded image.' });
  }
});

module.exports = router;
