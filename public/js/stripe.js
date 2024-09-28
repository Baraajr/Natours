/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51PhoCBKmRZVu2ts6CLj4j0fXMpK0i7RKqTMBvCHIqBPi0LMSOEX73QOn10mAw7zLEbhNXzoHkVjjbpincxD0cax200K4cx1MgH',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.error(err);
    showAlert('error', err.message || 'Something went wrong!');
  }
};
