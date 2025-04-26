const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('media.db');

app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  db.run(`INSERT INTO media (filename, path, type) VALUES (?, ?, ?)`,
    [file.filename, '/uploads/' + file.filename, file.mimetype],
    function(err) {
      if (err) return res.status(500).send(err);
      res.send({ message: 'Uploaded', id: this.lastID });
    }
  );
});

app.get('/all', (req, res) => {
  db.all('SELECT * FROM media', [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.send(rows);
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});