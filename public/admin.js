// public/admin.js

document.addEventListener('DOMContentLoaded', () => {
  fetch('/orders.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
      const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
      const worksheet = workbook.Sheets['Orders'];
      const html = XLSX.utils.sheet_to_html(worksheet);
      document.getElementById('orders').innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading orders:', error);
    });
});
