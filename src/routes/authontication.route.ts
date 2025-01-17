import express from "express";
const router=express.Router();
import {isLoggedIn} from "../middlewares/authontication/isLoggedIn";
import {isAuthenticated} from "../middlewares/authontication/role.middleware";
import{
  test,
  userRegistration,
  login,
  loggedOut,
  profileUpdate,
  getAllUsers
}from "../controllers/authontication/authontication";
import {upload_profile} from "../utils/multer.config";
router.route("/test").get(isLoggedIn,isAuthenticated(["admin","moderator"]),test);
router.route("/registration").post(upload_profile.single("profile"),userRegistration);
router.route("/login").post(login);
router.route("/logged-out").get(isLoggedIn,loggedOut);
router.route("/update_profile:id").patch(isLoggedIn,profileUpdate);
router.route("/getAllUsers").get(getAllUsers);
export default router;
