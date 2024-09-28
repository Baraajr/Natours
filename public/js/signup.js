/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signUp = async (name, email, password, passwordConfirm) => {
  const payload = {
    name,
    email,
    password,
    passwordConfirm,
  };

  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Signed up successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
