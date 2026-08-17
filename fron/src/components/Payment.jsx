import React from "react";
import axios from "axios";

const Payment = () => {
  const handlePayment = async () => {
    try {
      // Call your ASP.NET Core API
      const { data } = await axios.post(
        "https://localhost:7232/api/Dashboard/create-order?amount=10",
        null,
        {
          withCredentials: true,
        },
      );

      const options = {
        key: "rzp_test_SxZRfbjdpavgAB",
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,

        name: "Pharmacy App",
        description: "Test transaction",

        handler: async function (response) {
          console.log("Payment Success");
          console.log(response);

          const verifyResponse = await axios.post(
            "https://localhost:7232/api/Dashboard/verify-payment",
            {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            },
            {
              withCredentials: true,
            },
          );

          console.log(verifyResponse.data);

          alert("Payment Verified Successfully");
        },

        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },

        theme: {
          color: "#723b99",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error(response.error);

        alert("Payment Failed");
      });

      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div>
      <h2>Razorpay Demo</h2>

      <button onClick={handlePayment}>Pay ₹10</button>
    </div>
  );
};

export default Payment;