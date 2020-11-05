const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY
);
// let webhookEndpoints;
// (async () => {
//   webhookEndpoints = await stripe.webhookEndpoints.create(
//     {
//       url:
//         'https://example.com/my/webhook/endpoint',
//       enabled_events: [
//         'checkout.session.async_payment_succeeded',
//         'checkout.session.async_payment_failed',
//       ],
//     }
//   );
//   console.log(webhookEndpoints);
// })();

// console.log(
//   'WEBHOOK ENDPOINTS',
//   webhookEndpoints
// );

module.exports = stripe;
