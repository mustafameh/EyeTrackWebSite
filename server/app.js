const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/save-csv', (req, res) => {
  const csvData = req.body.csvData;
  const filename = req.body.filename || 'tracking-data.csv';
  const csvFolderPath = path.join(__dirname, 'CSV');
  const outputPath = path.join(csvFolderPath, filename);

  // Create the 'CSV' folder if it doesn't exist
  if (!fs.existsSync(csvFolderPath)) {
    fs.mkdirSync(csvFolderPath);
  }

  fs.writeFile(outputPath, csvData, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving file');
    } else {
      res.status(200).send('File saved successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
