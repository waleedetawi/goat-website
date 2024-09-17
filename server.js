// server.js

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handle order submission
app.post('/submit-order', async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'orders.xlsx');
    
    let worksheet;
    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
      worksheet = workbook.getWorksheet(1);
    } else {
      worksheet = workbook.addWorksheet('Orders');
      worksheet.columns = [
        { header: 'Name', key: 'name' },
        { header: 'Item', key: 'item' },
        { header: 'Quantity', key: 'quantity' }
      ];
    }
    
    worksheet.addRow(req.body);
    await workbook.xlsx.writeFile(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to submit order' });
  }
});

// Serve the orders.xlsx file
app.get('/orders.xlsx', (req, res) => {
  const filePath = path.join(__dirname, 'orders.xlsx');
  res.sendFile(filePath);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

