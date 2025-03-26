import { Router } from "express";
import { createFeedback, deleteFeedback, deleteUser, editFeedback, getAllUser, getAverageRating, getOneUser, loginUser, registerUser, verifyUser } from "../Controller/userController";

const router: Router = Router();

router.route("/register-user").post(registerUser);
router.route("/create-user-feedback/:userID/:workerID").post(createFeedback);

router.route("/verify-user/:userID").patch(verifyUser);
router.route("/signin-user/").patch(loginUser);
router.route("/feedback/:userID/:workerID").patch(editFeedback);

router.route("/get-one-user/:staffID").get(getOneUser);
router.route("/get-all-user/").get(getAllUser);
router.route("/staff/:workerID/average-rating").get(getAverageRating);

router.route("/delete-user/:userID").delete(deleteUser);
router.route("/feedback/:userID/:workerID").delete(deleteFeedback);

export default router;