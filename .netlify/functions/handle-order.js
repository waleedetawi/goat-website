const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
        try {
            const order = JSON.parse(event.body);

            // Path to your Excel file
            const filePath = path.join(__dirname, '../../orders.xlsx');

            let workbook;
            if (fs.existsSync(filePath)) {
                // Read existing file
                workbook = XLSX.readFile(filePath);
            } else {
                // Create new workbook
                workbook = XLSX.utils.book_new();
            }

            // Read or create the sheet
            const sheetName = 'Orders';
            let worksheet;
            if (workbook.SheetNames.includes(sheetName)) {
                worksheet = workbook.Sheets[sheetName];
            } else {
                worksheet = XLSX.utils.json_to_sheet([]);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            }

            // Read existing data
            const existingData = XLSX.utils.sheet_to_json(worksheet);
            existingData.push(order);

            // Write updated data to sheet
            worksheet = XLSX.utils.json_to_sheet(existingData);
            workbook.Sheets[sheetName] = worksheet;
            XLSX.writeFile(filePath, workbook);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Order received successfully' }),
            };
        } catch (error) {
            console.error('Error processing order:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Failed to process order' }),
            };
        }
    } else {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }
};
