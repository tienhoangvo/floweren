import axios from 'axios';
import { showAlert } from './alerts';

export const addToCart = async (productId) => {
  try {
    // 1) Get checkout session from API
    const res = await axios({
      method: 'POST',
      url: `/api/v1/cartItems/add-to-cart/${productId}`,
    });

    console.log(res);
    // 2) Create checkout from + charge credit card
    window.location.reload(true);
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
