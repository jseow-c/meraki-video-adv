const express = require("express");
const router = express.Router();

const controller = require("./controller");

router.get("/", controller.index);
router.get("/dashboard", controller.dashboard);
router.get("/video/:video", controller.loadVideo);
router.get("/next", controller.nextVideo);
router.get("/list", controller.listVideos);
router.post("/list/change", controller.changeVideos);
router.post("/snap", controller.snapPhoto);
router.post("/image/aws", controller.photoAWS);

module.exports = router;
