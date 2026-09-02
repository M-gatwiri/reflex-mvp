import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    retailerId: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    itemDescription: {
      type: String,
      required: true,
      trim: true,
    },

    riderId: {
      type: String,
      default: null,
    },

    riderName: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["OPEN", "ASSIGNED", "PICKED_UP", "DELIVERED"],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
);

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;