const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.js');
const Property = require('../models/listing.js');

const { isLoggedIn } = require('../middleware.js');

router.get('/', isLoggedIn, async (req, res) => {
    try {
      const bookings = await Booking.find({ user: req.user._id })
        .populate('property') // populate property details
        .exec();
      
      res.render('booking/booked', { bookings });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

router.post('/', isLoggedIn, async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).send('Property not found');

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return res.status(400).send('Invalid date range');

    const totalAmount = property.price * nights;

    const booking = new Booking({
      user: req.user._id,
      username: req.user.username,
      property: propertyId,
      checkIn,
      checkOut,
      totalNights: nights,
      totalAmount
    });

    await booking.save();
    res.redirect('/booking');
 // or show a success page
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
