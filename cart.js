/* cart.js */
document.addEventListener("DOMContentLoaded", function () {
  const cartItemsContainer = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("total");
  const form = document.getElementById("order-form");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;

  function renderCart() {
    cartItemsContainer.innerHTML = "";
    total = 0;

    cart.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image"/>
        <div class="cart-item-details">
          <p><strong>${item.name}</strong></p>
          <p>₹${item.price}</p>
          <button onclick="removeItem(${index})">Remove</button>
        </div>
      `;
      cartItemsContainer.appendChild(div);
      total += item.price;
    });

    totalDisplay.textContent = "Total: ₹" + total;
  }

  window.removeItem = function (index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const address = formData.get("address");
    const pincode = formData.get("pincode");

    const paymentMethod = formData.get("payment_method");

    const submitToSheet = (payment_id = "COD") => {
      const formElement = document.createElement("form");
      formElement.setAttribute("method", "POST");
      formElement.setAttribute(
        "action",
        "https://script.google.com/macros/s/AKfycby58Z8RkNUW22TEG8p1FXUqfTc-lIsLN8l3HEGf__85aJD2moMtqEuf99Hm1opBAFX3/exec"
      );

      const fields = {
        name,
        email,
        phone,
        address,
        pincode,
        cart: JSON.stringify(cart),
        total,
        payment_id,
        payment_method: paymentMethod,
      };

      for (const key in fields) {
        const input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", key);
        input.setAttribute("value", fields[key]);
        formElement.appendChild(input);
      }

      document.body.appendChild(formElement);

      // ✅ Clear cart BEFORE submitting
      localStorage.removeItem("cart");

      formElement.submit();

      // ✅ Redirect to thank you page after small delay
      setTimeout(() => {
        window.location.href = "thankyou.html";
      }, 1000);
    };

    if (paymentMethod === "COD") {
      alert("Thank you! Your order has been placed with Cash on Delivery.");
      submitToSheet(); // Use 'COD' as fake payment ID
    } else {
      const razorpayOptions = {
        key: "rzp_live_txdpgO15ZeYtHX",
        amount: total * 100,
        currency: "INR",
        name: "Ayurveda Wellness",
        description: "Order Payment",
        handler: function (response) {
          submitToSheet(response.razorpay_payment_id);
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: "#4caf50",
        },
      };

      const rzp = new Razorpay(razorpayOptions);
      rzp.open();
    }
  });

  renderCart();
});
