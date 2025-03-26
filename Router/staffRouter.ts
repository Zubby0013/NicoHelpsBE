import { Router } from "express";
import { createPost, deleteStaff, getAllStaff, getOneStaff, getStaffPosts, loginStaff, registerStaff, staffFirstLogin, verifyStaff } from "../Controller/staffController";
import { uploadImage } from "../Utils/Multer";
import multer from "multer";

const router: Router = Router();

router.route("/register-staff").post(registerStaff);
router.route("/create-post").post((req, res, next) => {
    uploadImage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ message: "File too large" });
            }
        } else if (err) {
            return res.status(500).json({ message: err.message });
        }
        next();
    });
}, createPost);

router.route("/verify-staff/:staffID").patch(verifyStaff);
router.route("/signin-staff/").patch(loginStaff);
router.route("/signin-first/:staffID").patch(staffFirstLogin);

router.route("/get-one-staff/:staffId").get(getOneStaff);
router.route("/get-all-staff/").get(getAllStaff);
router.route("/get-staff-post/:staffID").get(getStaffPosts);

router.route("/delete-staff/:staffID").delete(deleteStaff);

export default router;