import axios from 'axios';

import { showAlert } from './alerts';

export const getCategories = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/categories',
    });

    console.log(res.data.data.data);

    return res.data.data.data;
  } catch (error) {
    showAlert('error', 'Can load the categories');
  }
};
export const categoryOption = (category) => `
    <option value=${category._id}>${category.name}</option>
`;
