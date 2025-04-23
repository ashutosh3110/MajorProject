const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: "../.env" });
console.log("🔑 ENV:", process.env.CLOUD_NAME, process.env.CLOUD_API_KEY, process.env.CLOUD_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

cloudinary.uploader.upload("./test.jpeg", {
  folder: "test_upload" // ✅ You can customize the folder name
})
.then(result => {
  console.log("✅ Uploaded!", result.secure_url);
})
.catch(err => {
  console.error("❌ Upload failed:", err);
});




