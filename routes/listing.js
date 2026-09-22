const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const { create } = require("../models/review.js");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// index and create route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing),
  );

// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);

// NEW: must sit before /:id — Express matches routes top-down, and "mine"
// would otherwise be captured as an :id value and 500 on findById("mine")
router.get("/mine", isLoggedIn, wrapAsync(listingController.myListings));
router.post(
  "/:id/wishlist",
  isLoggedIn,
  wrapAsync(listingController.toggleWishlist),
);

router.post(
  "/generate-description",
  isLoggedIn,
  wrapAsync(listingController.generateDescription),
);

// show, update and delete
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// EDIT
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;
