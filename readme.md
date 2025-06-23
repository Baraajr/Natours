# 🌍 Natours API – Tour Booking REST API

A production-ready RESTful API for a fictional tour booking service, built with **Node.js**, **Express**, **MongoDB**, and follows the **MVC architecture**.

> Built as part of mastering advanced Node.js concepts using best practices and real-world patterns.

---

## 📦 Features

- 🧱 MVC (Model-View-Controller) architecture
- 🔐 User authentication & authorization using JWT
- ✉️ Email notifications (Mailtrap integration)
- 💾 MongoDB + Mongoose ODM
- 📊 Tour filtering, sorting, pagination
- ⭐️ Tour reviews & ratings
- 📍 Geo-spatial queries (find tours near location)
- 🖼 Image upload & processing (Multer + Sharp)
- 📈 Request logging, security headers, rate limiting, and sanitization

---

## 🧠 Technologies Used

- Node.js, Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- Multer & Sharp (file uploads)
- Nodemailer (Mailtrap for testing)
- Helmet, Rate Limiter, XSS Protection
- Express Validator
- Morgan (request logger)

---

## 📁 Project Structure (MVC)
```
natours/
│
├── controllers/ # Route handlers (business logic)
├── models/ # Mongoose models (User, Tour, Review, Booking)
├── routes/ # Express routers
├── utils/ # Utility modules (email, error handling, etc)
├── public/ # Static assets
├── dev-data/ # Import & test data scripts
├── app.js # Express app config
└── server.js # App entry point
```

---

## Scripts
```bash
# install depenecies
npm install

# run in dev
npm run start:dev

# run in prod
npm run start:prod
