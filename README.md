# Smile Bright - Modern Dental Clinic Website

A modern, full-featured dental clinic website with appointment booking, patient resources, and an admin dashboard.

---

## Features

- 🖼️ Modern, responsive homepage
- 👨‍⚕️ About page with clinic information
- 🦷 Services page showcasing dental treatments
- 📅 Online appointment booking system
- 📬 Contact form with message storage
- 🔐 Secure admin dashboard
- 📱 Fully responsive design
- 🗂️ **Patient Resources** section:
  - Downloadable and online-viewable resources (forms, guides, FAQs, emergency info)
  - Search, filter, and recently viewed resources
  - Dual HTML/PDF support for all resources
  - Polished, accessible UI with icons and clear navigation
- 🌐 Accessibility and dark mode support
- 🛡️ Authentication (JWT)
- 🔑 Password reset via email (secure token-based reset flow)

---

## Screenshots

> _Add screenshots or GIFs here!_
> Example: ![Patient Resources Screenshot](./screenshots/patient-resources.png)

---

## Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Authentication:** JWT
- **PDF Generation:** Puppeteer

---

## Project Structure

```
dentist-app/
├── backend/                    # Node.js + Express Backend
│   ├── controllers/            # Logic for bookings, contact, auth
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── middleware/             # Auth middleware
│   ├── config/                 # DB connection, environment
│   ├── server.js
│   └── package.json
│
├── frontend/                   # React Frontend
│   ├── public/
│   │   └── resources/          # All patient resource HTML & PDF files
│   ├── scripts/                # PDF generation script
│   ├── src/
│   │   ├── components/         # Navbar, Footer, Forms, etc.
│   │   ├── context/            # Auth, Theme context
│   │   ├── pages/              # Home, About, Services, Contact, Admin, PatientResources
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── .env
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```
3. **Create a `.env` file** in the root directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=3001
   ```
4. **Generate Patient Resource PDFs:**
   ```bash
   cd frontend
   node scripts/generate-pdfs.js
   ```
   This will convert all resource HTML files in `public/resources/` to PDFs for download.

5. **Start the development servers:**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd ../frontend
   npm start
   ```

---

## Password Reset & Email Setup

This project supports secure password reset via email. To enable this feature, you must configure email credentials for the backend.

### Email Environment Variables

In your `backend/.env` file, add the following (using your Gmail and an App Password):

```
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_SERVICE=gmail
```

- **EMAIL_USER**: Your Gmail address (must have 2-Step Verification enabled)
- **EMAIL_PASS**: An [App Password](https://support.google.com/accounts/answer/185833?hl=en) generated from your Google Account
- **EMAIL_SERVICE**: The email service provider (default: `gmail`)

### How Password Reset Works

1. User clicks "Forgot Password?" on the login page.
2. User enters their email address.
3. The backend generates a secure, time-limited token and sends a reset link to the user's email.
4. User clicks the link, enters a new password, and submits.
5. The password is securely updated in the database.

**Note:** Make sure your backend server can connect to Gmail (some networks may block SMTP).

---

## How to Add or Update Patient Resources

1. **Add a new HTML file** to the appropriate folder in `