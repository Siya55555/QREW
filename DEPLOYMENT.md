# QREW Portal — Production Deployment Guide

This guide covers deploying the QREW Portal prototype to production.

## Pre-deployment Checklist

- [ ] Update all secrets in `.env` (strong `JWT_SECRET`, `ADMIN_KEY`, Stripe keys)
- [ ] Change default password via admin UI
- [ ] Run SQLite migration: `node migrate.js`
- [ ] Test all flows locally: auth, exclusive gating, Stripe checkout
- [ ] Update `SUCCESS_URL` to your production domain
- [ ] Enable HTTPS on your server
- [ ] Set up environment variables on your host (never commit `.env`)

## Option 1: Deploy to Render (Recommended for Beginners)

### Steps
1. Push your project to GitHub (create a private repo)
2. Connect GitHub to Render: https://dashboard.render.com
3. Create a new **Web Service**
   - GitHub repo: select your QREW project
   - Environment: Node
   - Build: `npm install`
   - Start: `npm start`
   - Plan: Free tier available
4. Add environment variables in Render dashboard:
   - `PORT=3000`
   - `JWT_SECRET=your-strong-secret`
   - `ADMIN_KEY=your-admin-key`
   - `STRIPE_SECRET_KEY=sk_live_...` (production key)
   - `STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `SUCCESS_URL=https://your-domain.onrender.com/success.html`
5. Deploy and test

### HTTPS
Render provides HTTPS automatically for `.onrender.com` domains.

---

## Option 2: Deploy to Vercel (Frontend) + Separate Backend

If you prefer to split frontend and backend:

### Frontend (Vercel)
1. Create `vercel.json`:
```json
{
  "buildCommand": "echo 'static files'",
  "outputDirectory": "."
}
```
2. Push to GitHub and connect to Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.vercel.app`

### Backend (Vercel Serverless)
Convert `server.js` to a Vercel function in `api/index.js` or use a dedicated Node host (Render, Railway, Heroku).

---

## Option 3: Deploy to AWS (EC2 / Lightsail)

### Quick Start (Ubuntu)
```bash
# SSH into your instance
ssh -i key.pem ubuntu@your-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo
git clone https://github.com/your/repo.git
cd your-repo

# Install dependencies
npm install

# Run migration
node migrate.js

# Create .env (use a secrets manager in production)
nano .env
# Paste your secrets

# Start with PM2 (process manager)
sudo npm install -g pm2
pm2 start server.js --name "qrew-api"
pm2 startup
pm2 save

# Set up reverse proxy with Nginx
sudo apt-get install nginx
# Configure /etc/nginx/sites-available/default to proxy :3000

# Enable HTTPS with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

---

## Option 4: Deploy to Railway or DigitalOcean App Platform

Both support Node.js directly. Steps are similar to Render:
1. Connect GitHub repo
2. Add environment variables
3. Deploy (they auto-detect `package.json` and `npm start`)

---

## Database Backups

SQLite stores data in `data/qrew.db`. For production:

1. **Automated backups**: Set up a cron job to copy the DB to cloud storage:
   ```bash
   # Add to crontab: `crontab -e`
   0 2 * * * cp /path/to/qrew.db /backup/qrew_$(date +\%Y\%m\%d).db
   ```

2. **Cloud storage**: Use AWS S3, GCS, or similar to store backups.

---

## Security Hardening

### 1. Rate Limiting
Install `express-ratelimit`:
```bash
npm install express-ratelimit
```

Add to `server.js`:
```javascript
const rateLimit = require('express-ratelimit');
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 5 });
app.post('/api/auth', authLimiter, async (req, res) => { ... });
```

### 2. CORS
Currently allows all origins. Restrict in production:
```javascript
app.use(cors({ origin: 'https://your-domain.com' }));
```

### 3. Helmet (HTTP security headers)
```bash
npm install helmet
```
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. Admin Auth Upgrade
Replace `x-admin-key` header with proper admin login:
- Add `POST /api/admin/login` with username/password
- Return JWT or session token
- Protect admin endpoints with JWT verification

### 5. HTTPS / TLS
Always use HTTPS in production. Use Let's Encrypt (free) or AWS Certificate Manager.

### 6. Environment Variables
Never commit `.env`. Use your host's secrets manager:
- Render: Environment variables in dashboard
- AWS: AWS Secrets Manager or Parameter Store
- DigitalOcean: App Platform env vars
- GitHub: GitHub Secrets (for CI/CD)

---

## Monitoring & Logging

Add logging for errors and auth events:
```bash
npm install winston
```

Example in `server.js`:
```javascript
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'logs/app.log' })]
});

logger.info('Password attempt', { ip: req.ip, result: 'success/denied' });
```

---

## Scaling Notes

If you grow beyond single-instance SQLite:

1. **Migrate to PostgreSQL**: Use `pg` library instead of `better-sqlite3`
2. **Add caching**: Redis for tokens and session data
3. **Load balancing**: Use AWS ALB or Nginx to distribute traffic
4. **CDN**: CloudFlare or AWS CloudFront for static assets

---

## Support & Troubleshooting

- **Port conflicts**: Change `PORT` env var if 3000 is in use
- **Database locked**: Restart the server if SQLite is locked; switch to PostgreSQL for concurrency
- **CORS errors**: Update `cors()` origin to match your frontend domain
- **Stripe webhook failures**: Implement webhook handler in production for order confirmation

---

For questions or issues, refer to the main [README.md](README.md).
