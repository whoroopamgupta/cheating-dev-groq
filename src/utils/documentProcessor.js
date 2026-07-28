const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts text content from supported file types (PDF, DOCX, TXT)
 * @param {string} filePath - Absolute path to the file
 * @returns {Promise<string>} - The extracted raw text
 */
async function extractTextFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();

    try {
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } else if (ext === '.txt') {
            return fs.readFileSync(filePath, 'utf8');
        } else {
            throw new Error(`Unsupported file type: ${ext}. Only .pdf, .docx, and .txt are supported.`);
        }
    } catch (error) {
        throw new Error(`Failed to extract text from ${ext} file: ${error.message}`);
    }
}

module.exports = { extractTextFromFile };
