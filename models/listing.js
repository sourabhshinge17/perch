const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const CATEGORIES = [
  "Rooms",
  "Iconic Cities",
  "Mountains",
  "Castles",
  "Amazing Pools",
  "Camping",
  "Farms",
  "Arctic",
  "Beachfront",
  "Countryside",
  "Lake View",
  "Restaurants",
];

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: { type: String, default: "listingimage" },
    url: {
      type: String,
      default: "https://picsum.photos/400/400?random=1",
      set: (v) => (v === "" ? "https://picsum.photos/400/400?random=1" : v),
    },
  },
  price: Number,
  location: String,
  country: String,
  // NEW: backs the category filter row (Rooms, Mountains, Castles, etc.)
  category: {
    type: String,
    enum: CATEGORIES,
    default: "Rooms",
  },
  lat: Number,
  lng: Number,

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
Listing.CATEGORIES = CATEGORIES; // single source of truth, reused by seed script + controller

module.exports = Listing;
