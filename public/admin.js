document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/orders')  // Netlify will redirect this to the serverless function
    .then(response => response.json())
    .then(orders => {
      const tableBody = document.querySelector('#orders-table tbody');
      
      // Clear existing table content
      tableBody.innerHTML = '';

      // Populate table with order data
      orders.forEach(order => {
        const row = `<tr>
          <td>${order.RoomNumber}</td>
          <td>${order.Items}</td>
          <td>${order.Total}</td>
        </tr>`;
        tableBody.innerHTML += row;
      });
    })
    .catch(error => {
      console.error('Error loading orders:', error);
    });
});
