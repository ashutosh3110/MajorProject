const express= require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema}=require("../schema.js");
const Review=require("../models/reviews.js");
const listing=require("../models/listing.js");
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/reviews.js");




 
   //post review 

   router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
   
   //delete review route

   router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.deleteReview)
);

module.exports=router;
