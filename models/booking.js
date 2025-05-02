const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     required: true
     },
     username: { 
        type: String // Add this field to store username
      },
  property: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'listing',
      required: true
     },
  checkIn: { 
    type: Date, 
    required: true 
},
  checkOut: { 
    type: Date,
     required: true
     },
  totalNights: Number,
  totalAmount: Number,
  status: {
     type: String, 
     default: 'booked' 
    }
}, 
{ 
    timestamps: true 
});

module.exports = mongoose.model('Booking', bookingSchema);