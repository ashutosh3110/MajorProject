if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}


const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing,isAdmin } = require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({ storage });

router.get('/admin/requests', isAdmin,listingController.adminRequests);
router.post('/admin/approve/:id', isAdmin,listingController.adminApprove);
router.post('/admin/reject/:id', isAdmin,listingController.adminReject);  

// router.route("/")
// .get(wrapAsync(listingController.index))
//  .post(isLoggedIn,upload.single("image"), validateListing, wrapAsync(listingController.createListing));

//  router.post("/",(req,res)=>{
//     console.log(req.body);
//     res.send("done");
//  })
// .post( isLoggedIn, upload.single("image"),validateListing, wrapAsync(listingController.createListing));
router.get("/", async (req, res) => {
  let { category } = req.query;
  let filter = {};

  if (category) {
    filter.category = category;
  }
  filter.status = "approved";

  const allListings = await listing.find(filter);
  res.render("listings/index", { allListings, category });
});


 router.post("/",isLoggedIn,upload.single("image"),(req,res,next)=>{
 console.log(req.body);
 console.log(req.file);
 next();
 
 

 
},validateListing, wrapAsync(listingController.createListing))
//  router.post("/",isLoggedIn,(req, res) => {
//     console.log("🧪 Route hit");
//     console.log("📦 Body:", req.body);
//     console.log("🖼 File:", req.file);
//     res.send("OK");
//   });
  



// New Route
router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put( isLoggedIn, isOwner, upload.single("image"),validateListing, wrapAsync(listingController.updateListing))
.delete( isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));
router.get("/maps-api-key",listingController.mapToken)


module.exports = router;