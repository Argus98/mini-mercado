const express = require("express");
const ctrl = require("../controllers/orderController");

const router = express.Router();

router.post("/", ctrl.createOrder);
router.get("/", ctrl.getOrders);

module.exports = router;