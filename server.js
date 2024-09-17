const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');  // Already declared here
const xlsx = require('xlsx');
const tmp = require('tmp');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the main index.html file for customers
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Endpoint to get orders data for the admin page
app.get('/api/orders', (req, res) => {
    const orders = readOrdersFromFile(); // This function reads orders from the Excel file
    res.json(orders);
});

// Path to save the Excel file
const filePath = path.join(__dirname, 'orders.xlsx');

// Function to read existing orders from Excel
function readOrdersFromFile() {
    if (fs.existsSync(filePath)) {
        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets['Orders'];
        return xlsx.utils.sheet_to_json(worksheet);
    }
    return [];
}

// Endpoint to handle order submissions
app.post('/api/orders', (req, res) => {
    const { roomNumber, items } = req.body;

    // Read existing orders from the Excel file
    let orders = readOrdersFromFile();

    // Add the new order
    orders.push({
        RoomNumber: roomNumber,
        Items: items.map(item => `${item.name} (x${item.quantity})`).join(', '),
        Total: items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2) + ' JD'
    });

    // Convert updated orders to an Excel worksheet
    const worksheet = xlsx.utils.json_to_sheet(orders);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Write to a temporary file, then replace the original file
    const tempFile = tmp.fileSync({ postfix: '.xlsx' });
    try {
        xlsx.writeFile(workbook, tempFile.name);
        fs.renameSync(tempFile.name, filePath);
    } catch (err) {
        console.error('Error writing Excel file:', err);
        return res.status(500).json({ message: 'Failed to save order' });
    } finally {
        tempFile.removeCallback();  // Clean up temp file
    }

    // Respond to the frontend
    res.json({ message: 'Order received successfully' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
