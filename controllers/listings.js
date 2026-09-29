const Listing = require("../models/listing");
const { uploadToCloudinary } = require("../cloudconfig");
const axios = require("axios");
const User = require("../models/user");
const { generateListingDescription } = require("../utils/aiDescription");

function attachAvgRating(listings) {
  listings.forEach((listing) => {
    if (listing.reviews.length > 0) {
      const total = listing.reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      listing.avgRating = total / listing.reviews.length;
    } else {
      listing.avgRating = null;
    }
  });
}

module.exports.index = async (req, res) => {
  const { category, search, location, priceMax } = req.query;
  let filter = {};

  if (category && category !== "Trending") {
    filter.category = category;
  }

  // Support BOTH ?search= and ?location= params
  const searchTerm = search || location;
  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { location: { $regex: searchTerm, $options: "i" } },
      { country: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (priceMax) {
    filter.price = { $lte: Number(priceMax) };
  }

  let allListings = await Listing.find(filter).populate("reviews");

  if (!category || category === "Trending") {
    allListings.sort((a, b) => b.reviews.length - a.reviews.length);
  }

  attachAvgRating(allListings);

  res.render("listings/index", {
    allListings,
    activeCategory: category || "Trending",
    searchLocation: searchTerm || "",
  });
};
// NEW: powers the "My Listings" navbar link
module.exports.myListings = async (req, res) => {
  const allListings = await Listing.find({ owner: req.user._id }).populate(
    "reviews",
  );
  attachAvgRating(allListings);

  res.render("listings/index", {
    allListings,
    activeCategory: "Trending",
    searchLocation: "",
  });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    newListing.image = {
      filename: result.public_id,
      url: result.secure_url,
    };
  }

  newListing.owner = req.user._id;

  const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: `${req.body.listing.location}, ${req.body.listing.country}`,
      format: "json",
      limit: 1,
    },
    headers: { "User-Agent": "Perch-App" },
  });
  newListing.lat = geoRes.data[0]?.lat || 0;
  newListing.lng = geoRes.data[0]?.lon || 0;

  await newListing.save();

  req.flash("success", "New Listing Created Successfully!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  attachAvgRating([listing]);

  let isWishlisted = false;

  if (req.user) {
    const user = await User.findById(req.user._id);

    isWishlisted = user.wishlist.some(
      (listingId) => listingId.toString() === listing._id.toString(),
    );
  }

  res.render("listings/show", {
    listing,
    isWishlisted,
  });
};
module.exports.updateListing = async (req, res) => {
  console.log("REQ.BODY:", req.body);
  const { id } = req.params;
  let listing = await Listing.findById(id);
  listing.set(req.body.listing);

  const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: `${req.body.listing.location}, ${req.body.listing.country}`,
      format: "json",
      limit: 1,
    },
    headers: { "User-Agent": "Perch-App" },
  });
  listing.lat = geoRes.data[0]?.lat || 0;
  listing.lng = geoRes.data[0]?.lon || 0;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    listing.image = { filename: result.public_id, url: result.secure_url };
  }

  await listing.save();
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  let orignalImageUrl = listing.image.url;
  orignalImageUrl = orignalImageUrl.replace("/upload", "/upload/h_300,w_250");

  res.render("listings/edit", {
    listing,
    orignalImageUrl,
    categories: Listing.CATEGORIES,
  });
};
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new", {
    categories: Listing.CATEGORIES,
  });
};

module.exports.toggleWishlist = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);

  // Check if listing already exists in wishlist
  const exists = user.wishlist.some((listingId) => listingId.toString() === id);

  if (exists) {
    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      (listingId) => listingId.toString() !== id,
    );

    req.flash("success", "Removed from wishlist ❤️");
  } else {
    // Add to wishlist
    user.wishlist.push(id);

    req.flash("success", "Added to wishlist ❤️");
  }

  await user.save();

  res.redirect(`/listings/${id}`);
};

module.exports.generateDescription = async (req, res) => {
  const { title, category, location } = req.body;

  // what do you do if title is missing/empty? (think Step 4 —
  // validate BEFORE calling the AI, don't waste a request)

  const description = await generateListingDescription({
    title,
    category,
    location,
  });
  res.json({ description });
};

const parseSearchFilters = require("../utils/searchParser");

const SEARCH_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "google/gemma-4-26b-a4b-it:free",
  "qwen/qwen3.8-27b:free",
];

module.exports.aiSearch = async (req, res) => {
  const { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Search query is required" });
  }

  const prompt = `You are a search query parser for a property listing site.
Convert the user's plain-English query into a JSON object with
exactly these three fields: category, priceMax, location.

Valid category values: ${Listing.CATEGORIES.join(", ")}
(use one of these exactly, or null if none clearly match)

priceMax: a number, or null if no price limit mentioned
location: a short place name string, or null if not mentioned

Return ONLY the JSON object, nothing else — no explanation, no markdown, no code fences.

Example output: {"category": "Beachfront", "priceMax": 5000, "location": "Goa"}

User query: "${query}"`;

  let rawContent = null;

  for (const model of SEARCH_MODELS) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 7000,
        },
      );
      rawContent = response.data.choices[0]?.message?.content;
      if (rawContent) break;
    } catch (err) {
      console.log(`AI search model ${model} failed: ${err.message}`);
    }
  }

  const filters = rawContent
    ? parseSearchFilters(rawContent, Listing.CATEGORIES)
    : null;

  if (!filters) {
    // graceful fallback: treat the raw query as a plain location/text search
    return res.json({ category: null, priceMax: null, location: query });
  }

  res.json(filters);
};
