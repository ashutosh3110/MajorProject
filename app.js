if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}
const express=require("express");
const app=express();

app.locals.mapToken = process.env.MAP_TOKEN;

const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

 const dbUrl=process.env.atlasDb_Url;

async function main() {
    await mongoose.connect(dbUrl);
    
}

main()
.then(() =>{
    console.log("Connect to db");
})
.catch((err) =>{
    console.log(err);
})
app.use(express.json()); // Parses JSON data
app.use(express.urlencoded({ extended: true }));  // Parses form data (x-www-form-urlencoded)



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600
})
 
store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
})

const sessionOption={
  store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true

    },

};


// app.get("/",(req,res)=>{
//     res.send("hello i am here");
// });

app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next) =>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    
    next();
});

// app.get("/demouser",async(req,res) =>{
//     let fackUser=new User({
//         email:"ashutoshbankey@gmail.com",
//         username:"Ashutosh"
//     });
//    let newUser=await User.register(fackUser,"ashu1234");
//    res.send(newUser);

// })
// app.get("/check-session", (req, res) => {
//     console.log("Session:", req.session);
//     console.log("User:", req.user);
//     res.send(`Is Authenticated: ${req.isAuthenticated()}`);
// });
const Listing = require("./models/listing"); // make sure path is correct

app.get("/fix-coordinates", async (req, res) => {
  const allListings = await Listing.find({});
  for (let listing of allListings) {
    if (listing.geometry && listing.geometry.coordinates.length === 2) {
      const [lat, lng] = listing.geometry.coordinates; // wrong order
      listing.geometry.coordinates = [lng, lat]; // fix it
      await listing.save();
    }
  }
  res.send("✅ All coordinates fixed!");
});







app.use("/listing",listingRouter);
app.use("/listing/:id/reviews",reviewRouter);
app.use("/",userRouter);
app.use((req, res, next) => {
    res.setTimeout(10000, () => {
      console.log('Request has timed out.');
      res.status(408).send('Request Timeout');
    });
    next();
  });

// app.get("/api",(req,res)=>{
//     const apiKey = process.env.MAP_TOKEN;
// const address = "indore madhya pradesh india";

// fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`)
//   .then(response => response.json())
//   .then(data => {
//     const location = data.results[0].geometry.location;
//     console.log("Latitude:", location.lat, "Longitude:", location.lng);
//     res.send("done");
//   })
//   .catch(error => console.error(error));
// })

const bodyParser = require('body-parser');




// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');



  app.get('/check-session', (req, res) => {
    res.send(req.session);
  });
 







// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});



app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err,req,res,next) =>{
    let {statusCode=500,message="Something went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);


});




app.listen(8080, ()=>{
    console.log("server is listning on port 8081");
     

})
