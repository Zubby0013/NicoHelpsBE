import { Router } from "express";
import { createAdmin, loginAdmin, monitorActivities } from "../Controller/adminController";

const router: Router = Router();

router.route("/create-admin").post(createAdmin);
router.route("/signin-admin/:adminID").patch(loginAdmin);
router.route("/monitor-activities/:adminID").patch(monitorActivities);


export default router;