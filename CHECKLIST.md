# QREW Portal — Client Delivery Checklist

**Date Delivered**: December 21, 2025

---

## 📦 What You're Receiving

A production-ready custom brand website with:
- ✅ Terminal-style UI (3 theme options: Lavender, Brown, Charcoal)
- ✅ Password-gated exclusive preorder section
- ✅ Admin dashboard for managing content, passwords, and exclusive toggle
- ✅ Stripe Checkout integration (real payment processing)
- ✅ SQLite database (persistent storage)
- ✅ Full source code and documentation

---

## 📂 Files & Folders

**Frontend**:
- `index.html` — Main portal UI
- `admin.html` — Admin control panel
- `success.html` — Stripe checkout success/cancel page
- `styles.css` — All theming and responsive design
- `script.js` — Authentication and UI logic

**Backend**:
- `server.js` — Express API (auth, exclusive content, admin, checkout)
- `migrate.js` — SQLite database initialization and migration

**Configuration**:
- `package.json` — Node.js dependencies
- `.env.example` — Environment variables template (copy to `.env` with your secrets)
- `data/qrew.db` — SQLite database (auto-created)

**Documentation**:
- `README.md` — Quick start, API reference, customization guide
- `DEPLOYMENT.md` — Step-by-step guides for production deployment
- `CHECKLIST.md` — This file

---

## ⚙️ Setup Instructions

### Local Development (Testing)

1. **Install Node.js** (if you don't have it):
   - Download: https://nodejs.org/ (LTS version recommended)
   - Verify: `node --version` and `npm --version` in terminal

2. **Install dependencies**:
   ```bash
   cd Brand
   npm install
   ```

3. **Configure secrets** (`.env`):
   ```bash
   cp .env.example .env
   # Edit .env with:
   # - JWT_SECRET: strong random string (min 32 chars)
   # - ADMIN_KEY: strong random string
   # - STRIPE_SECRET_KEY: your Stripe test secret key
   # - STRIPE_PUBLISHABLE_KEY: your Stripe test publishable key
   # - SUCCESS_URL: http://localhost:3000/success.html (for local testing)
   ```

4. **Initialize database**:
   ```bash
   npm run migrate
   ```

5. **Start server**:
   ```bash
   npm start
   ```
   Server runs on: http://localhost:3000

6. **Open in browser**:
   - Portal: http://localhost:3000/index.html
   - Admin: http://localhost:3000/admin.html

7. **Test flows**:
   - Enter password: `QREW2025` (default, or your custom password)
   - Change password in admin (enter your ADMIN_KEY)
   - Toggle exclusive on/off
   - Test Stripe with card: `4242 4242 4242 4242`

---

## 🚀 Production Deployment

See `DEPLOYMENT.md` for detailed guides. Quick summary:

### Recommended: Deploy to Render (5 min setup)
1. Push code to private GitHub repo
2. Create Web Service on Render.com
3. Connect GitHub repo
4. Add environment variables (JWT_SECRET, ADMIN_KEY, Stripe LIVE keys)
5. Deploy (auto-HTTPS provided)

### Cost Estimate
- Render: Free tier available ($0–7/month for hobby tier)
- Stripe: 2.9% + $0.30 per transaction
- Domain: $10–15/year (optional, Render gives you free subdomain)

---

## 🔐 Customization Checklist

Before going live:

- [ ] Change default password from `QREW2025` to something secure
- [ ] Update colors/fonts to match your brand (edit `styles.css`)
- [ ] Update navigation tab labels in `index.html` sidebar
- [ ] Add your logo (create an image in brand colors and reference in HTML)
- [ ] Replace sample products with real items (use admin.html)
- [ ] Set correct `SUCCESS_URL` for your domain
- [ ] Stripe: Switch from test keys to **LIVE keys** (production only)
- [ ] Enable HTTPS on your production domain
- [ ] Set up email confirmations for exclusive access (optional enhancement)
- [ ] Test entire flow end-to-end (password → exclusive → Stripe → success)

---

## 🎨 Customize Your Brand

### Colors
Edit `styles.css`. Look for `:root { --bg, --accent, ... }` and `.theme-lavender`, `.theme-brown`, `.theme-charcoal`.

Example:
```css
.theme-yourtheme {
  --bg: #001a1a;
  --accent: #00ff99;
  --panel: #002220;
  --card: #003333;
}
```

### Typography
Current font: `Inconsolata` (monospace, loaded from Google Fonts).  
To change: Replace in `styles.css` `font-family:` declaration.

### Logo
1. Save your logo as `logo.png` in the project folder
2. Add to `index.html` in the sidebar:
```html
<img src="logo.png" style="height: 40px; margin-bottom: 12px;" />
```

### Products
Use admin.html (`http://localhost:3000/admin.html`):
1. Enter your ADMIN_KEY
2. Paste JSON array in "Exclusive Products" field
3. Include: `id`, `title`, `desc`, `priceCents`
4. Click Save Settings

---

## 🛡️ Security Reminders

**Before Launch**:
- [ ] Replace test Stripe keys with **LIVE keys**
- [ ] Use strong JWT_SECRET (min 32 random characters)
- [ ] Use strong ADMIN_KEY (min 20 random characters)
- [ ] Never commit `.env` to GitHub
- [ ] Enable HTTPS on your domain
- [ ] Set CORS origin to your domain (not "*")
- [ ] Implement rate limiting on `/api/auth` (added in DEPLOYMENT.md)

**Ongoing**:
- [ ] Monitor server logs for failed auth attempts
- [ ] Rotate secrets quarterly
- [ ] Keep Node.js and dependencies updated
- [ ] Back up your SQLite database regularly

---

## 📊 Admin Features

**Admin Panel**: http://localhost:3000/admin.html (or your production URL)

**What you can do**:
1. **Toggle Exclusive**: Enable/disable the QREW EXCLUSIVE section
2. **Change Gate Password**: Update the password users enter
3. **Manage Products**: Add/remove/edit exclusive product list (JSON)
4. **View Settings**: Load and review current configuration

**How to use**:
1. Enter your ADMIN_KEY (from `.env`)
2. Make changes (toggle, password, products)
3. Click "Save Settings"
4. If successful, "Saved" message appears

---

## 🧪 Testing Checklist

### Local Testing (before deployment)
- [ ] Server starts without errors: `npm start`
- [ ] Portal loads: http://localhost:3000/index.html
- [ ] Admin loads: http://localhost:3000/admin.html
- [ ] Password gate works (QREW2025)
- [ ] Admin can toggle exclusive on/off
- [ ] Admin can change password
- [ ] Exclusive products display when enabled
- [ ] Theme switcher works (Lavender, Brown, Charcoal)
- [ ] Stripe checkout redirects (use test card 4242...)
- [ ] Success page shows after checkout

### Production Testing
- [ ] Site loads over HTTPS
- [ ] Password gate still works
- [ ] Admin panel accessible
- [ ] Real Stripe keys working (test transaction)
- [ ] Email confirmations sent (if implemented)
- [ ] Database backed up successfully

---

## 📞 Support & Troubleshooting

### Common Issues

**"Cannot find module"**  
Run: `npm install`

**"Port 3000 already in use"**  
Change in `.env`: `PORT=3001` (or any free port)

**"Access Denied" despite correct password**  
1. Check that exclusive is **Enabled** in admin.html
2. Verify password is correct (admin can reset it)

**"Stripe checkout not working"**  
1. Check Stripe keys in `.env` are correct
2. Ensure `SUCCESS_URL` matches your domain
3. Test card: `4242 4242 4242 4242`

**"Database locked" errors**  
Restart server: `npm start`

### Getting Help
1. Check `README.md` API documentation
2. Review `DEPLOYMENT.md` for your hosting platform
3. Check server logs (terminal output) for error messages
4. Verify `.env` has all required variables

---

## 📈 Next Steps (Recommended Enhancements)

**Short term**:
- [ ] Add email notification on successful purchase
- [ ] Implement proper admin login UI (replace admin key header)
- [ ] Add order history / tracking
- [ ] Set up Stripe webhooks for payment confirmation

**Medium term**:
- [ ] Add member/user accounts (optional)
- [ ] Implement email list signup
- [ ] Add analytics (Plausible, Fathom, etc.)
- [ ] Create mobile app (React Native / Flutter)

**Long term**:
- [ ] Migrate to PostgreSQL for scalability
- [ ] Add inventory management
- [ ] Implement pre-launch notification system
- [ ] Build custom dashboard for sales analytics

---

## 📝 Project Handoff Notes

**Code Quality**:
- All code is documented with inline comments
- Modular structure (separate frontend/backend/DB logic)
- Error handling included throughout

**Maintainability**:
- Simple SQLite DB (can migrate to PostgreSQL later)
- Express API (standard Node.js framework, easy to extend)
- No build step needed (pure HTML/CSS/JS frontend)

**Extensibility**:
- Easy to add more product categories
- Stripe integration ready for upsells
- Admin API supports custom client implementations
- Database schema supports orders, inventory, etc.

---

## ✅ Final Checklist Before Launch

- [ ] All customizations complete (brand colors, logo, copy)
- [ ] Admin account set up with strong ADMIN_KEY
- [ ] Stripe keys updated to LIVE (not test)
- [ ] Domain purchased and SSL certificate installed
- [ ] Database backup system configured
- [ ] Email notifications set up (optional)
- [ ] Analytics installed (optional)
- [ ] All flows tested end-to-end
- [ ] Team trained on admin panel usage
- [ ] Deployment guide reviewed and understood
- [ ] Support/escalation plan in place

---

**Delivery Date**: December 21, 2025  
**Status**: Production Ready  
**Support**: See README.md and DEPLOYMENT.md for detailed guidance.

---

Thank you for choosing this custom platform. For ongoing support, refer to code comments and documentation.
