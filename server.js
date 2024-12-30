import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = 3000;

// In-memory storage for file codes (in a real app, use a database)
const fileCodes = new Map();

app.use(express.json());

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const code = req.body.code;
    
    if (!file || !code) {
      return res.status(400).json({ error: 'File and code are required' });
    }

    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    const newFilename = fileId + fileExtension;
    const newPath = path.join('uploads', newFilename);

    await fs.rename(file.path, newPath);

    fileCodes.set(code, { id: fileId, filename: file.originalname, path: newPath });

    console.log(`File uploaded with code: ${code}`);
    res.json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

app.get('/download/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const fileInfo = fileCodes.get(code);

    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found' });
    }

    console.log(`File downloaded with code: ${code}`);
    res.download(fileInfo.path, fileInfo.filename);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'File download failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// For demonstration purposes, log when a file is uploaded or downloaded
console.log('Server is ready to handle file transfers.');