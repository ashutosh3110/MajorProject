const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./reviews.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    
    image: {
        type: {
            url: String,
            filename:String
        },
        
    },
    price:Number,
    location:String,
    country:String,
    review:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        },
    ],

    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    geometry: {
        type: {
          type: String, // Don't forget this
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
      },
      category:String,

});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in: listing.review}});
    }
})
const listing=mongoose.model("listing",listingSchema);
module.exports=listing;