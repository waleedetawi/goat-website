document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('orderForm');
  const loadingIndicator = document.getElementById('loading-indicator'); // Optional: Add a loading indicator

  orderForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Show loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'block';
    }

    // Validate form data
    const formData = new FormData(orderForm);
    const roomNumber = formData.get('roomNumber');
    if (!roomNumber.trim()) {
      alert('Please enter a room number.');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      return;
    }

    try {
      const response = await fetch('/submit-order', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      const data = await response.json();
      alert('Order submitted successfully!');
      orderForm.reset(); // Clear the form after submission

    } catch (error) {
      console.error('Error submitting order:', error);
      alert('There was a problem submitting your order.');
    } finally {
      // Hide loading indicator
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
    }
  });

  // Function to add items to the cart
  function addToCart(itemName, itemPrice) {
    let item = cart.find(i => i.name === itemName);
    if (item) {
      item.quantity += 1;
    } else {
      cart.push({ name: itemName, price: itemPrice, quantity: 1 });
    }
    displayCart();
  }

  // Function to display the cart
  function displayCart() {
    let cartItemsDiv = document.getElementById('cart-items');
    let cartTotalDiv = document.getElementById('cart-total');
    cartItemsDiv.innerHTML = '';

    let total = 0;
    cart.forEach(item => {
      let itemTotal = item.price * item.quantity;
      total += itemTotal;
      cartItemsDiv.innerHTML += `<p><strong>${item.name}</strong> (x${item.quantity}) - ${itemTotal.toFixed(2)} JD</p>`;
    });

    cartTotalDiv.innerHTML = `Total: ${total.toFixed(2)} JD`;
  }

  // Initialize cart
  let cart = [];

  // Optionally, add some sample items to the cart
  // addToCart('Sample Item', 10.00); // Uncomment this line if you want to add sample items
});
