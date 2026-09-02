import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
      required: true,
    },

    previousStatus: {
      type: String,
      required: true,
    },

    newStatus: {
      type: String,
      required: true,
    },

    changedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StatusHistory = mongoose.model(
  "StatusHistory",
  statusHistorySchema
);

export default StatusHistory;