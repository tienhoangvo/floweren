import axios from 'axios';
import { showAlert } from './alerts';

export const updateMe = async (data, type) => {
  try {
    const res = await axios({
      url: `${
        window.location.origin
      }/api/v1/users/${
        type === 'password'
          ? 'updateMyPassword'
          : 'updateMe'
      }`,
      method: 'PATCH',
      data,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `Updated your account ${type} successfully`
      );

      if (type === 'updateMe') {
        document
          .querySelector('.form__user-photo')
          .setAttribute(
            'src',
            res.data.data.user.photo
          );

        document
          .querySelector('.nav__user-img')
          .setAttribute(
            'src',
            res.data.data.user.photo
          );
      }
    }
  } catch (error) {
    showAlert(
      'error',
      error.response.data.message
    );
  }
};
