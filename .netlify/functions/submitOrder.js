const xlsx = require('xlsx');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const tmp = require('tmp');

exports.handler = async function(event, context) {
  const { roomNumber, items } = JSON.parse(event.body);
  const bucketName = 'your-bucket-name'; // Replace with your actual S3 bucket
  const key = 'orders.xlsx';

  try {
    // Fetch the current orders from S3
    const data = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
    const workbook = xlsx.read(data.Body, { type: 'buffer' });
    const worksheet = workbook.Sheets['Orders'];
    const orders = xlsx.utils.sheet_to_json(worksheet);

    // Add the new order
    orders.push({
      RoomNumber: roomNumber,
      Items: items.map(item => `${item.name} (x${item.quantity})`).join(', '),
      Total: items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2) + ' JD',
    });

    // Create a new Excel file with updated orders
    const newWorksheet = xlsx.utils.json_to_sheet(orders);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Orders');

    // Write to a temporary file
    const tempFile = tmp.fileSync({ postfix: '.xlsx' });
    xlsx.writeFile(newWorkbook, tempFile.name);

    // Upload the new file to S3
    const fileContent = fs.readFileSync(tempFile.name);
    await s3.putObject({
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
    }).promise();

    // Clean up temp file
    tempFile.removeCallback();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order received successfully' }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to submit order' }),
    };
  }
};
