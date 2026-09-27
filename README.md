# ShopSphere

A full-stack, single-store e-commerce demo built with React, Vite, Express, MongoDB, and JWT. It demonstrates catalog management, customer accounts, inventory-aware carts, checkout, order history, and admin operations. Checkout records an order but does not collect payment.

## Features

- Customer registration, sign-in, editable profile, and order history
- Search, category and maximum-price filters, sorting, product details, and responsive product grid
- Guest shopping bag and saved items, synced to an account at sign-in
- Cart quantity controls with server-side stock validation
- Demo checkout with shipping calculation and inventory reservation/rollback
- Admin product creation/edit/deletion, order status updates, and registered-user list
- Seed catalog with useful local demo inventory

## Requirements

- Node.js 20 or newer and npm
- MongoDB running locally, or a MongoDB connection string

## Local setup

1. Copy `.env.example` to `.env` in this folder. Replace `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`; set `MONGODB_URI` if MongoDB is not local.
2. Install dependencies from this folder: `npm install`.
3. Seed demo products and provision the optional admin account: `npm run seed`.
4. Start the API and client together: `npm run dev`.
5. Open `http://localhost:5174` and sign in with the configured admin email/password to use **Studio admin**.

The API health check is at `http://localhost:5002/api/health`. The client and API can also be started separately with `npm run dev --workspace shopsphere-client` and `npm run dev --workspace shopsphere-server`.

## Environment

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign seven-day JWTs; replace the example value |
| `PORT` | API port, default `5002` |
| `CLIENT_ORIGIN` | Allowed browser origin, default `http://localhost:5174` |
| `VITE_API_URL` | API base URL used by the browser client |
| `ADMIN_EMAIL` | Optional admin email provisioned by the seed command |
| `ADMIN_PASSWORD` | Optional admin password, at least eight characters |

## Notes

This is a portfolio demo, not a production commerce system. Checkout does not process payment, tax, or shipping carrier integrations. The product seed uses remote demo photography; replace it with images you own or are licensed to use before public distribution. Do not use real customer or payment data.

## Vercel

Import this repository into Vercel with the repository root as the project root. The included `vercel.json` builds the Vite client into `public/`, rewrites browser routes to the SPA, and leaves `/api/*` on the Express app. Add `MONGODB_URI` and a strong `JWT_SECRET` in Vercel Project Settings before using account, cart, order, or admin features. To provision the admin account, run the seed command against the hosted database with `ADMIN_EMAIL` and `ADMIN_PASSWORD` set locally; never commit those secrets. Without a hosted MongoDB URI, the product demo remains visible but database-backed API features will return errors.
