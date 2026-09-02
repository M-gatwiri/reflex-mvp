import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const users = [
  {
    name: "Mercy Retail",
    email: "retailer@reflex.com",
    phone: "0712345678",
    role: "RETAILER",
  },
  {
    name: "James Dispatcher",
    email: "dispatcher@reflex.com",
    phone: "0723456789",
    role: "DISPATCHER",
  },
  {
    name: "Brian Rider",
    email: "brian@reflex.com",
    phone: "0734567890",
    role: "RIDER",
  },
  {
    name: "Ann Rider",
    email: "ann@reflex.com",
    phone: "0745678901",
    role: "RIDER",
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await User.deleteMany();

    await User.insertMany(users);

    console.log("Demo users created successfully");

    await mongoose.disconnect();

    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedUsers();