# 🏡 Perch

> **A full-stack Airbnb-inspired property platform built from scratch.**

Perch is a production-deployed web application where users can **discover, search, filter, and manage property listings** with authentication, image uploads, reviews, interactive maps, and AI-powered natural-language search.

🚀 **Built to demonstrate real-world full-stack development — from database design and authentication to cloud deployment and AI integration.**

---

## 🚀 Live Demo

### 🌐 [Visit Perch](https://perch-wa7d.onrender.com)

### 💻 [View Source Code](https://github.com/sourabhshinge17/perch)

> **Note:** The application is hosted on Render, so the first request may take a few seconds if the service is waking up.

---

## 📸 Preview

![Perch Preview](./ss.png)

---

## 🧠 Key Features

### 🤖 AI-Powered Natural Language Search

Search for properties using normal human language instead of manually selecting filters.

**Example:**

> `cheap mountain stay under 3000`

The application sends the query to an AI model, extracts relevant search parameters, and converts them into listing filters.

**AI can identify:**

- 📍 Location
- 💰 Maximum price
- 🏷️ Property category

---

### 🔍 Smart Search & Filtering

Users can discover listings using multiple filters:

- Search by location
- Filter by category
- Filter by maximum price
- Search across listing information
- Combine multiple filters

---

### 🗺️ Interactive Maps

Every listing can be associated with a geographical location.

Perch uses:

- **Leaflet.js**
- Geocoding
- Interactive map markers

This allows users to visually understand where a property is located.

---

### 📸 Cloud Image Uploads

Listing images are uploaded and managed using **Cloudinary**.

This provides:

- Image hosting
- Cloud storage
- Optimized image delivery
- Multiple listing images

---

### 🔐 Authentication & Authorization

Secure user authentication is implemented using **Passport.js**.

Users can:

- Register
- Login
- Logout
- Create listings
- Edit their own listings
- Delete their own listings
- Manage their account-specific content

Protected routes prevent unauthorized listing operations.

---

### ⭐ Reviews & Ratings

Users can interact with listings through a review system.

Features include:

- Add reviews
- Delete reviews
- Rating system
- Average rating calculation
- Review count

---

### 🏠 Listing Management

Authenticated users can manage their own properties.

**CRUD operations:**

```text
Create → Read → Update → Delete
```
