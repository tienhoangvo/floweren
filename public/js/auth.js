import axios from 'axios';

import { showAlert } from './alerts';

export const login = async (data) => {
  console.log(data);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Logged in successfully'
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert(
      'error',
      error.response.data.message
    );
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.status === 'success')
      location.assign('/');
  } catch (err) {
    showAlert(
      'error',
      'Error logging out! Try again'
    );
  }
};

export const signup = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Signed up succesfully'
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert(
      'error',
      error.response.data.message
    );
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: { email },
    });

    console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
    }
  } catch (error) {
    showAlert(
      'error',
      error.response.data.message
    );
  }
};

export const resetPassword = async (data) => {
  try {
    console.log(
      window.location.pathname.split('/')
    );
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${
        window.location.pathname.split('/')[2]
      }`,
      data: data,
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);
      setTimeout(() => {
        window.location.assign('/login');
      }, 1500);
    }
  } catch (error) {
    showAlert(
      'error',
      error.response.data.message
    );
  }
};
