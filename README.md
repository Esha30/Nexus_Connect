# Nexus Platform

> The premier investor-entrepreneur matching platform for the next generation of venture capital.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API Key
- Stripe account (for billing features)

### Installation

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd nexus
```

**2. Setup the Backend**
```bash
cd nexus-backend
npm install
cp .env.example .env     # Fill in your secrets
npm run dev
```

**3. Setup the Frontend**
```bash
cd Nexus-main
npm install
npm run dev
```

The app will be available at `http://localhost:5173` and the API at `http://localhost:5001`.

---

## 🔑 Environment Variables

Create a `.env` file in `nexus-backend/` with the following:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
EMAIL_USER=your_email_for_sending
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:5173
PORT=5001
```

> ⚠️ **Never commit your `.env` file.** It is protected by `.gitignore`.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Real-time | Socket.IO |
| AI Engine | Google Gemini (multi-model fallback) |
| Auth | JWT + Google OAuth 2.0 + 2FA |
| Payments | Stripe |
| Documents | PDFKit, Multer |

---

## 📦 Key Features

- **AI-Powered Matching** — Synergy analysis between investors and founders
- **Deal Protocols** — AI-generated Term Sheets (PDF) saved to Document Repository
- **Sub-Zero Messaging** — Real-time chat with Socket.IO
- **Video Boardrooms** — WebRTC-powered video calls
- **Document Terminal** — Upload, categorize, e-sign, and securely share assets
- **Platform Protocol** — Built-in documentation center (no external links)
- **Billing Engine** — Stripe-integrated subscription management

---

## 🔐 Security

- All routes are JWT-protected
- AI endpoints are rate-limited (20 req / 15 min)
- NoSQL injection protection middleware
- Documents are stored server-side with access permissions
- CORS is whitelisted to known origins only

---

## 🧪 Running Tests

```bash
cd nexus-backend
npm test
```

---

## 📁 Project Structure

```
nexus/
├── nexus-backend/         # Express API
│   ├── controllers/       # Route handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routers
│   ├── middleware/        # Auth, validation
│   ├── utils/             # Email, helpers
│   └── uploads/           # Stored documents (gitignored)
└── Nexus-main/            # React Frontend
    └── src/
        ├── pages/         # 17 page modules
        ├── components/    # Reusable UI components
        ├── context/       # Auth, Socket, Theme providers
        └── api/           # Axios instance
```

---

## 👥 Test Accounts

| Role | Email | Note |
|---|---|---|
| Investor | `investor@nexus.test` | Sarah Mitchell |
| Entrepreneur | `entrepreneur@nexus.test` | Alex Carter |

> Use the **Forgot Password** flow to reset test account passwords.

---

*Built with ❤️ by the Nexus Team*
