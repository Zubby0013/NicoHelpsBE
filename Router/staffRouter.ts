import { Router } from "express";
import { deleteStaff, getAllStaff, getOneStaff, loginStaff, registerStaff, staffFirstLogin, verifyStaff } from "../Controller/staffController";

const router: Router = Router();

router.route("/register-user").post(registerStaff);

router.route("/verify-user/:userID").patch(verifyStaff);
router.route("/signin-user/").patch(loginStaff);
router.route("/signin-first/:staffID").patch(staffFirstLogin);

router.route("/get-one-staff/:staffId").get(getOneStaff);
router.route("/get-all-staff/").get(getAllStaff);

router.route("/delete-staff/:userID").delete(deleteStaff);

export default router;