# QREW Portal — Custom Brand Website (Production Ready)

A minimal, utilitarian backend-inspired portal site with terminal-style UI, password-gated exclusive preorders, and integrated Stripe checkout.

**Status**: MVP with Node/Express backend, SQLite database, admin controls, and Stripe integration ready.

---

## 🎯 Features

✅ **Terminal-style UI** — green-on-black / lavender / brown / charcoal themes  
✅ **Responsive navigation** — system menu (Products, Members Only, About, QREW EXCLUSIVE)  
✅ **Password-gated exclusive section** — bcrypt-hashed, server-side auth  
✅ **Admin dashboard** — toggle exclusive, update password, manage products  
✅ **Stripe Checkout** — real payment integration (test mode ready)  
✅ **SQLite database** — persistent storage, migration-ready  
✅ **Monospace typography** — clean, minimal, system-inspired  
✅ **Subtle animations** — hover states, loading indicators, cursor effects  

---

## 📁 Project Structure

```
Brand/
├── index.html              — Main portal UI
├── admin.html              — Admin control panel
├── success.html            — Stripe checkout success/cancel page
├── styles.css              — Terminal-style theming (3 color schemes)
├── script.js               — Frontend auth & theme logic
├── server.js               — Express API (auth, exclusive, admin, checkout)
├── migrate.js              — SQLite migration script
├── package.json            — Node dependencies
├── .env.example            — Environment variables template
├── .env                    — Your actual secrets (never commit)
├── data/
│   ├── qrew.db             — SQLite database (auto-created)
│   └── config.json         — Legacy JSON store (optional fallback)
├── README.md               — This file
├── DEPLOYMENT.md           — Production deployment guide
└── node_modules/           — Dependencies (after npm install)
```

---

## 🚀 Quick Start (Local Development)

### Requirements
- Node.js 14+ (download from https://nodejs.org/)
- npm (comes with Node.js)

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Copy and configure `.env`**:
```bash
cp .env.example .env
# Edit .env with your values:
# - JWT_SECRET: strong random string (for JWT signing)
# - ADMIN_KEY: strong random string (for admin API access)
# - STRIPE_SECRET_KEY: test key from Stripe dashboard
# - STRIPE_PUBLISHABLE_KEY: test key from Stripe dashboard
# - SUCCESS_URL: where to redirect after checkout
```

3. **Initialize database**:
```bash
node migrate.js
```
This creates `data/qrew.db` and migrates any existing config.json data.

4. **Start the server**:
```bash
npm start
```
Server runs on `http://localhost:3000`.

5. **Open in browser**:
- **Portal**: http://localhost:3000/index.html
- **Admin**: http://localhost:3000/admin.html (use your ADMIN_KEY to log in)

6. **Test the flows**:
   - Default password: `QREW2025` (or your custom password set in admin)
   - Change password via admin panel
   - Toggle exclusive on/off
   - Test Stripe checkout with test card `4242 4242 4242 4242`

---

## 🔐 API Endpoints

All endpoints run on your server (default: http://localhost:3000).

### Public Endpoints

**POST `/api/auth`**  
Authenticate with password to get a JWT token.
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"QREW2025"}'
# Response: { "token": "eyJhbGc..." }
```

**GET `/api/exclusive`**  
Fetch exclusive products (requires Bearer token).
```bash
curl http://localhost:3000/api/exclusive \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: { "products": [ {...}, {...} ] }
```

**GET `/api/config`**  
Get public config (Stripe publishable key).
```bash
curl http://localhost:3000/api/config
# Response: { "stripePublishableKey": "pk_test_..." }
```

**POST `/api/create-checkout-session`**  
Create a Stripe Checkout session.
```bash
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"productId":"EX-01","quantity":1}'
# Response: { "sessionId": "cs_test_..." }
```

### Admin Endpoints

**GET `/api/admin/settings`**  
Fetch current admin settings (requires admin key).
```bash
curl http://localhost:3000/api/admin/settings \
  -H "x-admin-key: YOUR_ADMIN_KEY"
```

**PUT `/api/admin/settings`**  
Update exclusive toggle, password, or products.
```bash
curl -X PUT http://localhost:3000/api/admin/settings \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "exclusiveEnabled": true,
    "password": "new_password",
    "exclusiveProducts": [
      {"id":"EX-01","title":"Item","desc":"Desc","priceCents":2500}
    ]
  }'
```

---

## 🎨 Customization

### Change Color Themes
Edit `styles.css`:
- `.theme-lavender` — Lavender + dark background
- `.theme-brown` — Brown + warm accent
- `.theme-charcoal` — Neon green (original terminal look)

### Update Exclusive Products
Use the admin panel (`http://localhost:3000/admin.html`):
1. Enter your ADMIN_KEY
2. Paste a JSON array in "Exclusive Products" field:
```json
[
  {
    "id": "PRODUCT-1",
    "title": "Product Title",
    "desc": "Short description",
    "priceCents": 2500
  }
]
```
3. Click Save Settings

### Modify Navigation Tabs
Edit `index.html` sidebar:
```html
<li data-tab="products">Your Tab Name</li>
```

### Update Typography
All text uses `Inconsolata` font (loaded from Google Fonts). Replace in `styles.css`:
```css
font-family: 'Your Font', Menlo, monospace;
```

---

## 🔒 Security Notes

### Development vs. Production

**Development** (current state):
- Test Stripe keys OK for testing
- Simple admin key authentication
- HTTP allowed locally
- SQLite in project folder

**Production** (before launch):
- Switch to live Stripe keys
- Implement proper admin login (username/password + JWT)
- Force HTTPS
- Move database to secure location
- Enable rate limiting on `/api/auth`
- Add logging and monitoring
- See [DEPLOYMENT.md](DEPLOYMENT.md) for full hardening guide

### Key Secrets
Never commit `.env`. Store in your host's secrets manager:
- GitHub Actions: GitHub Secrets
- Render / Railway: Environment variables in dashboard
- AWS: AWS Secrets Manager
- DigitalOcean: App Platform env vars

---

## 📊 Database (SQLite)

The app uses SQLite for persistence. Migration happens automatically on first run.

### Tables
- **settings** — exclusiveEnabled toggle, passwordHash
- **products** — exclusive product catalog
- **orders** — preorder/checkout records (Stripe integration)

### Backup
```bash
# Manual backup
cp data/qrew.db backup/qrew_$(date +%Y%m%d).db
```

For production, set up automated backups (see [DEPLOYMENT.md](DEPLOYMENT.md)).

---

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guides:
- **Render** (recommended, free tier available)
- **Vercel** (frontend) + separate backend
- **AWS EC2/Lightsail**
- **Railway** or **DigitalOcean App Platform**

Quick Render setup:
1. Push to GitHub
2. Create Web Service on Render, connect repo
3. Set environment variables
4. Deploy (auto-HTTPS)

---

## 🧪 Testing Stripe Checkout

Use Stripe test mode:

**Test card**: `4242 4242 4242 4242`  
**Expiry**: Any future date (e.g., 12/25)  
**CVC**: Any 3 digits  

After checkout, you'll be redirected to `success.html` with session details. In production, you'd confirm payment server-side and send a confirmation email.

---

## 📝 Next Steps

- [ ] Replace test Stripe keys with live keys (production only)
- [ ] Customize colors, fonts, copy to match brand
- [ ] Add email confirmations for exclusive access
- [ ] Implement proper admin login UI
- [ ] Set up Stripe webhook for order confirmation
- [ ] Deploy to production (see DEPLOYMENT.md)
- [ ] Monitor logs and performance

---

## 🆘 Troubleshooting

**"Server not running"**  
Check that `npm start` is active. Port 3000 should be listening.

**"Access Denied when password is correct"**  
Admin must toggle "Exclusive: Enabled" first (in admin.html).

**"Stripe checkout not working"**  
Ensure your Stripe keys are correct and `SUCCESS_URL` is reachable.

**Database errors**  
Delete `data/qrew.db` and run `node migrate.js` again to reset.

---

## 📞 Support

For issues, questions, or customization requests, refer to inline code comments in:
- `server.js` — API logic
- `script.js` — Frontend auth & UI
- `migrate.js` — Database setup

---

**Built with**: Node.js, Express, SQLite, Stripe, HTML/CSS/JS  
**License**: Private (client work)

Next steps I can do for you:
- Replace sample assets with your brand files (logos, fonts, colors).
- Implement a secure server-side password gate + admin panel for toggling exclusive "on/off".
- Wire real product data and checkout (Shopify/Stripe/custom).
- Produce a screen recording of the mockup interaction for submission.

Tell me which of the next steps you want me to do first.
