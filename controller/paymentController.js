const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const Tour = require('../model/tourModel');
const stripe = require('stripe')(STRIPE_SECRET_KEY);

exports.checkout = async (req, res) => {
  const tour = await Tour.findById(req.params.tourId);
  let tourprice = Math.round(tour.price / 83);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name}`,
          },
          unit_amount: tourprice * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:5500/success.html',
    cancel_url: 'http://localhost:4000/cancel.html',
  });

  res.json({
    status: 'success',
    data: {
      chsekoutpage: session.url,
      userMail: req.user.email,
      tourDetails: {
        name: tour.name,
        price: `$${tourprice}`,
      },
    },
  });
  console.log(session.url);
};
