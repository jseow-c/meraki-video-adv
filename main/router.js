const express = require("express");
const router = express.Router();

const controller = require("./controller");

router.get("/", controller.index);
router.get("/dashboard", controller.dashboard);
router.get("/admin", controller.admin);
router.get("/next", controller.nextVideo);
router.get("/rules", controller.listRules);
router.post("/rules/update", controller.updateRules);
router.get("/list", controller.listVideos);
router.post("/list/change", controller.changeVideos);
router.post("/list/update", controller.updateVideos);
router.post("/snap", controller.snapPhoto);
router.post("/image/aws", controller.photoAWS);

module.exports = router;
