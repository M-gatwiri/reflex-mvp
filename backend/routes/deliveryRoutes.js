import express from "express";
import Delivery from "../models/Delivery.js";
import User from "../models/User.js";
import StatusHistory from "../models/StatusHistory.js";


const router = express.Router();

// Get all deliveries
router.get("/", async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch deliveries",
      error: error.message,
    });
  }
});

// Create a delivery
router.post("/", async (req, res) => {
  try {
    const {
      retailerId,
      customerName,
      customerPhone,
      address,
      itemDescription,
    } = req.body;

    const delivery = await Delivery.create({
      retailerId,
      customerName,
      customerPhone,
      address,
      itemDescription,
    });

    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create delivery",
      error: error.message,
    });
  }
});

// Get status history for a delivery
router.get("/:id/history", async (req, res) => {
  try {
    const history = await StatusHistory.find({
      deliveryId: req.params.id,
    }).sort({ createdAt: 1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch delivery history",
      error: error.message,
    });
  }
});

// Assign a rider to a delivery
router.patch("/:id/assign", async (req, res) => {
  try {
    const { riderId } = req.body;

    const rider = await User.findOne({
      _id: riderId,
      role: "RIDER",
    });

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    const delivery = await Delivery.findOne({
      _id: req.params.id,
      status: "OPEN",
    });

    if (!delivery) {
      return res.status(409).json({
        message: "Delivery is no longer open for assignment",
      });
    }

    const previousStatus = delivery.status;

    delivery.riderId = rider._id.toString();
    delivery.riderName = rider.name;
    delivery.status = "ASSIGNED";

    await delivery.save();

    await StatusHistory.create({
      deliveryId: delivery._id,
      previousStatus,
      newStatus: "ASSIGNED",
      changedBy: "demo-user",
    });

    res.json(delivery);
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign rider",
      error: error.message,
    });
  }
});
// Update delivery status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const validTransitions = {
      OPEN: ["ASSIGNED"],
      ASSIGNED: ["PICKED_UP"],
      PICKED_UP: ["DELIVERED"],
      DELIVERED: [],
    };

    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        message: "Delivery not found",
      });
    }

    const allowedNextStatuses = validTransitions[delivery.status];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${delivery.status} to ${status}`,
      });
    }

    const previousStatus = delivery.status;

    delivery.status = status;

    await delivery.save();

    await StatusHistory.create({
      deliveryId: delivery._id,
      previousStatus,
      newStatus: status,
      changedBy: "demo-user",
    });

    res.json(delivery);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update delivery.",
      error: error.message,
    });
  }
});

export default router;