const xlsx = require('xlsx');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async function(event, context) {
  const bucketName = 'your-bucket-name'; // Replace with your actual S3 bucket
  const key = 'orders.xlsx';

  try {
    // Fetch the Excel file from S3
    const data = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
    const workbook = xlsx.read(data.Body, { type: 'buffer' });
    const worksheet = workbook.Sheets['Orders'];
    const orders = xlsx.utils.sheet_to_json(worksheet);

    return {
      statusCode: 200,
      body: JSON.stringify(orders),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error fetching orders' }),
    };
  }
};
