const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");
require('dotenv').config()

  const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

const dbUrl=process.env.atlasDb_Url;
main()
.then(() =>{
    console.log("Connect to db");
})
.catch((err) =>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
    
}

const initDB=async() =>{
    await listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"67ea13171b4b93682d74baa5"}));
    await listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();