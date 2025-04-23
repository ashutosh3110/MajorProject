const listing=require("../models/listing");
const Review=require("../models/reviews");

module.exports.createReview=async(req,res)=>{
    let listings=await listing.findById(req.params.id); 
    let newReview=new Review(req.body.Review);
    newReview.author=req.user._id;
    listings.review.push(newReview);
    await newReview.save();
    await listings.save();
    req.flash("success","New Review Created");
    res.redirect(`/listing/${listings._id}`);
   };

   module.exports.deleteReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted");
    res.redirect(`/listing/${id}`);
   };