const User=require("../models/user");

module.exports.renderSignUpForm=(req,res) =>{
    res.render("users/user.ejs");
};

module.exports.signup=async(req,res)=>{
    try{
        const {username,email,password,role}=req.body;
        const newUser=new User({email,username,role});
        const registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","welcome to wonderlust");
            res.redirect("/listing");
        })
       
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
   
};

module.exports.renderLogInForm=(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login=async(req,res)=>{
    req.session.user = {
        username: req.user.username,
        role: req.user.role || 'user' // fallback to 'user' if not set
      };
    req.flash("success","Welcome back to Wanderlust!");
    let redirectUrl=res.locals.redirectUrl || "/listing";
    res.redirect(redirectUrl);
};

module.exports.logout=(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            console.log(err);
            return next(err);
        }
        req.flash("success","You are logged out");
        res.redirect("/listing");
    });
};
