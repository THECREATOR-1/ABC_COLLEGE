const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || keyId === 'rzp_test_your_key_id') {
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const createOrder = async (amount, receipt) => {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    return { mock: true, orderId: `order_mock_${Date.now()}`, amount: amount * 100 };
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: receipt.substring(0, 40),
  });
  return order;
};

const verifyPayment = (orderId, paymentId, signature) => {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    return true;
  }

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = { getRazorpayInstance, createOrder, verifyPayment };
