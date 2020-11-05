import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51H52O7J1XGebaHa6V9w1PW0UXEZ4i6nY2l0je5ifxIkhBxMQl3PTJWDUCi9lQ3Abscv9JAgDJUmQkSCyrsgagYzH00l5pH1tv0'
);

export const orderProducts = async () => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      '/api/v1/orders/checkout-session/'
    );

    console.log(session);
    // 2) Create checkout from + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
