import { Router } from "express";
import { deleteUser, getAllUser, getOneUser, loginUser, registerUser, verifyUser } from "../Controller/userController";

const router: Router = Router();

router.route("/register-user").post(registerUser);
router.route("/verify-user/:userID").patch(verifyUser);
router.route("/signin-user/").patch(loginUser);
router.route("/get-one-user/").get(getOneUser);
router.route("/get-all-user/").get(getAllUser);

router.route("/delete-user/:userID").delete(deleteUser);

export default router;