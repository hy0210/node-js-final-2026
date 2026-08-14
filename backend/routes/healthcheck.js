import express from "express";

const router = express.Router();

/* GET health check. */
router.get("/", function (req, res) {
  res.status(200).json({ status: "success" });
});

export default router;
