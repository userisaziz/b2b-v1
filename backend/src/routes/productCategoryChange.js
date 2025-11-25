const router = require("express").Router();
const controller = require("../controllers/productCategoryChangeRequest.controller");
const { auth, isSeller, isAdmin } = require("../middleware/auth");

// seller
router.post("/", auth, isSeller, controller.createRequest);

// admin
router.get("/", auth, isAdmin, controller.getAllRequests);
router.put("/:id/approve", auth, isAdmin, controller.approveRequest);
router.put("/:id/reject", auth, isAdmin, controller.rejectRequest);

module.exports = router;
