const express = require('express');
const router = express.Router();

// Helper to determine mime type and size from base64 string
const parseBase64File = (base64Str) => {
  if (!base64Str) {
    return { file_valid: false, file_mime_type: null, file_size_kb: null };
  }

  try {
    // Check format: data:<mime>;base64,<data>
    const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return { file_valid: false, file_mime_type: null, file_size_kb: null };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Calculate size in KB
    const buffer = Buffer.from(base64Data, 'base64');
    const sizeKb = parseFloat((buffer.length / 1024).toFixed(2));

    return {
      file_valid: true,
      file_mime_type: mimeType,
      file_size_kb: sizeKb
    };
  } catch (error) {
    return { file_valid: false, file_mime_type: null, file_size_kb: null };
  }
};

// @desc    BFHL Challenge Endpoint (GET)
// @route   GET /bfhl
router.get('/', (req, res) => {
  res.status(200).json({
    operation_code: 1
  });
});

// @desc    BFHL Challenge Endpoint (POST)
// @route   POST /bfhl
router.post('/', (req, res) => {
  try {
    const { data = [], file_b64 = null } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        message: "Invalid input: 'data' must be an array of strings."
      });
    }

    const numbers = [];
    const alphabets = [];

    // Parse array
    data.forEach(item => {
      const strItem = String(item).trim();
      if (!strItem) return;

      if (!isNaN(strItem) && /^\d+$/.test(strItem)) {
        numbers.push(strItem);
      } else if (/^[a-zA-Z]$/.test(strItem)) {
        alphabets.push(strItem);
      }
    });

    // Find highest alphabet (case-insensitive)
    let highestAlphabet = [];
    if (alphabets.length > 0) {
      let maxChar = alphabets[0];
      alphabets.forEach(char => {
        if (char.toLowerCase() > maxChar.toLowerCase()) {
          maxChar = char;
        }
      });
      highestAlphabet.push(maxChar);
    }

    // Parse base64 file if present
    const fileInfo = parseBase64File(file_b64);

    // Formulate personalized BFHL response
    const response = {
      is_success: true,
      user_id: "shivam_kumar_23091983", // format: firstname_lastname_ddmmyyyy
      email: "shivamkumar230983@acropolis.in",
      roll_number: "shivamkumar203",
      numbers,
      alphabets,
      highest_alphabet: highestAlphabet,
      ...fileInfo
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      is_success: false,
      message: "Server error occurred during request processing.",
      error: error.message
    });
  }
});

module.exports = router;
