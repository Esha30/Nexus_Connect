# 🚀 Deploying Nexus to Render

The project is now ready for deployment using **Render Blueprints**. This guide will walk you through the process.

## Prerequisites

1. A **GitHub repository** with this code.
2. A **MongoDB Atlas** database.
3. API Keys for **Google Gemini**, **Stripe**, and **Google OAuth**.

## Deployment Steps

### 1. Connect to Render
1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file and prepare the services.

### 2. Configure Environment Variables
During the setup, Render will ask you for values for the following variables:

**For `nexus-backend`:**
- `MONGODB_URI`: Your MongoDB connection string.
- `FRONTEND_URL`: Leave empty initially, then update it to the `nexus-frontend` URL once deployed.
- `GEMINI_API_KEY`: Your Google AI key.
- `EMAIL_USER` / `EMAIL_PASS`: SMTP credentials.
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`: Your Stripe keys.
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID.

**For `nexus-frontend`:**
- `VITE_API_URL`: Set this to your backend URL + `/api` (e.g., `https://nexus-backend.onrender.com/api`).

### 3. Circular Dependency Fix
1. Once both services are deployed, copy the **nexus-frontend** URL (e.g., `https://nexus-frontend.onrender.com`).
2. Go to the **nexus-backend** settings on Render.
3. Update the `FRONTEND_URL` environment variable with this value.
4. Render will restart the backend to apply the change.

## Verification
- Once deployed, visit your frontend URL.
- Try to register an account.
- Check the **Admin Panel** at `/admin`.

---

*Need help? Reach out to the support team or check the internal documentation.*
