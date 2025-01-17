import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname,'../../public/assets/user_profile_images/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+"_"+file.originalname)
  }
})

export const upload_profile = multer({ storage });