const listing=require("../models/listing");
const fetch = require('node-fetch');
require("dotenv").config();
const AbortController = require('abort-controller');

module.exports.index=async (req, res) => {
    const allListings = await listing.find({ status: "approved" }); 
    res.render("listings/index.ejs", { allListings });
}

module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const foundListing = await listing.findById(id).populate({ path: "review", populate: { path: "author", }, }).populate("owner");
    if (
        foundListing.status !== "approved" &&
        (!req.user || (req.user._id.toString() !== foundListing.owner._id.toString() && req.user.role !== "admin"))
      ) {
        req.flash("error", "You don't have permission to view this listing.");
        return res.redirect("/listing");
      }
    if (!foundListing) {
        req.flash("error", "Listing you requested for does not exists");
        res.redirect("/listing");
    }
    // console.log(foundListing);
    console.log("Geometry:", foundListing.geometry);

    const [lng, lat] = foundListing.geometry.coordinates;

const coordinates = { lat,lng };
console.log(coordinates);
console.log("Coordinates from DB:", foundListing.geometry.coordinates);

   
    res.render("listings/show.ejs", { 
        foundListing, 
         currUser: req.user,
         coordinates,
         
        mapToken: process.env.MAP_TOKEN , // ✅ pass the token to the EJS file
         
    });
    
};  

module.exports.createListing=async (req, res, next) => {
        try {
        
              console.log("the data is");
              console.log(req.body);
              console.log(req.file);

            const location = req.body.listing.location;
            const {category}=req.body;
            
            
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 50000); // 10 sec

    
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.MAP_TOKEN}`;
         console.log(url);
        const geoRes = await fetch(url, { signal: controller.signal });
          console.log("Fetching geolocation URL:", geoRes);
          
            clearTimeout(timeout);
            const geoData = await geoRes.json();
            console.log(geoData);
            
    
            if (!geoData.results || geoData.results.length === 0) {
                req.flash("error", "Invalid location. Unable to fetch coordinates.");
                return res.redirect("/listing/new");
            }
    
            const coords = geoData.results[0].geometry.location;

    
            const newListing = new listing(req.body.listing);
            newListing.owner = req.user._id;
            newListing.status = "pending";
            newListing.category=category;
    
            if (req.file) {
                newListing.image = {
                    url: req.file.path,
                    filename: req.file.filename
                };
            } else {
                newListing.image = {
                    url: "https://images.unsplash.com/photo-1739518805568-41e07e3318b8?q=80&w=1984&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    filename: "default.jpg"
                };
            }
    
            newListing.geometry = {
                type: "Point",
                coordinates: [coords.lng, coords.lat]
            };
    
            const savedListing = await newListing.save();
            console.log("Saved listing:", savedListing);
    
            req.flash("success", "New Listing Added");
            res.redirect("/listing");
        }  catch (err) {
            if (err.name === 'AbortError') {
                console.error("❌ Google Maps request timed out.");
                req.flash("error", "Google Maps request timed out. Please try again.");
                return res.redirect("/listing/new");
            }
            console.error("❌ Error creating listing:", err.message || err);
            req.flash("error", "Something went wrong while creating the listing.");
            return res.redirect("/listing/new");
        }
        
        };

    


module.exports.editListing=async (req, res) => {
    let { id } = req.params;
    const editListing = await listing.findById(id);
    if (!editListing) {
        req.flash("error", "Listing you requested for does not exists");
        res.redirect("/listing");
    }
    let originalImageUrl=editListing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250"); 
    res.render("listings/edit.ejs", { editListing,originalImageUrl });
};

module.exports.updateListing=async (req, res) => {

    let { id } = req.params;
    let existingListing = await listing.findById(id);

    // Update fields manually
    existingListing.title = req.body.listing.title;
    existingListing.description = req.body.listing.description;
    existingListing.price = req.body.listing.price;
    existingListing.location = req.body.listing.location;
    existingListing.country = req.body.listing.country;

    // If new image uploaded
    if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;
        existingListing.image = { url, filename };
    }

    await existingListing.save();

    req.flash("success", "Listing Updated");
    res.redirect(`/listing/${id}`);
};

module.exports.deleteListing=async (req, res) => {
    let { id } = req.params;
    const deleteListing = await listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listing");
};
module.exports.mapToken=(req, res) => {
    res.json({ apiKey: process.env.MAP_TOKEN });
  }
module.exports.adminRequests=async (req, res) => {
    const pendingListings = await listing.find({ status: "pending" });
  res.render('listings/admin_requests', { listings: pendingListings });
};
module.exports.adminApprove=async(req, res) => {
    await listing.findByIdAndUpdate(req.params.id, { status: "approved" });
    req.flash("success", "Listing approved successfully");
    res.redirect('/listing');
  };
  module.exports.adminReject=async(req, res) => {
    await listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing rejected and deleted");
    res.redirect('/listing/admin/requests');
  };