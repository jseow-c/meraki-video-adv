const express = require("express");
const router = express.Router();

const controller = require("./controller");

router.get("/offline", controller.index_offline);
router.get("/test", controller.test);
router.get("/dashboard-offline", controller.dashboard_offline);
router.get("/offline/video/:video", controller.loadVideo);
router.get("/offline/next", controller.offline_nextVideo);
router.get("/offline/list", controller.offline_listVideos);
router.post("/offline/list/change", controller.offline_changeVideos);

router.get("/", controller.index);
router.get("/dashboard", controller.dashboard);
router.get("/next", controller.nextVideo);
router.get("/list", controller.listVideos);
router.post("/list/change", controller.changeVideos);
router.post("/snap", controller.snapPhoto);
router.post("/image/aws", controller.photoAWS);

module.exports = router;
