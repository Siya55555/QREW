require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
app.use(express.json());
app.use(cors());

// Serve frontend static files from project root so admin and index pages
// can call API on the same origin (visit http://localhost:3000/admin.html)
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me-admin-key';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';
const SUCCESS_URL = process.env.SUCCESS_URL || 'http://localhost:8000/success.html';
const stripe = STRIPE_SECRET_KEY ? Stripe(STRIPE_SECRET_KEY) : null;

async function ensureConfig(){
  try{
    await fs.mkdir(DATA_DIR, { recursive: true });
    let exists = true;
    try{ await fs.access(CONFIG_PATH); } catch(e){ exists = false; }
    if(!exists){
      const defaultCfg = {
        exclusiveEnabled: false,
        // if empty, server will set default hash for 'QREW2025'
        passwordHash: '',
        exclusiveProducts: [
          { id:'EX-01', title:'EX-01 • Preorder', desc:'Member-only design • Limited' },
          { id:'EX-02', title:'EX-02 • Preorder', desc:'Prototype bundle' }
        ]
      };
      await fs.writeFile(CONFIG_PATH, JSON.stringify(defaultCfg, null, 2));
    }
    // ensure passwordHash
    const raw = await fs.readFile(CONFIG_PATH, 'utf8');
    const cfg = JSON.parse(raw);
    if(!cfg.passwordHash){
      const hash = await bcrypt.hash('QREW2025', 10);
      cfg.passwordHash = hash;
      await fs.writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2));
      console.log('Default password set to QREW2025 (change via admin API)');
    }
  }catch(err){ console.error('Error ensuring config', err); process.exit(1); }
}

async function readConfig(){
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeConfig(cfg){
  await fs.writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

app.post('/api/auth', async (req, res) => {
  const { password } = req.body || {};
  if(!password) return res.status(400).json({ error:'missing password' });
  const cfg = await readConfig();
  const ok = await bcrypt.compare(password, cfg.passwordHash);
  if(!ok) return res.status(401).json({ error:'invalid' });
  const token = jwt.sign({ access: 'exclusive' }, JWT_SECRET, { expiresIn: '1h' });
  return res.json({ token });
});

// return public config (e.g., Stripe publishable key)
app.get('/api/config', (req, res)=>{
  res.json({ stripePublishableKey: STRIPE_PUBLISHABLE_KEY });
});

// create a Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res)=>{
  if(!stripe) return res.status(500).json({ error:'stripe_not_configured' });
  const { productId, quantity } = req.body || {};
  if(!productId) return res.status(400).json({ error:'missing_productId' });
  // read products from config
  const cfg = await readConfig();
  const product = cfg.exclusiveProducts.find(p=>p.id===productId) || cfg.exclusiveProducts[0];
  const unitAmount = ((product && product.priceCents) ? product.priceCents : 2000); // default $20.00

  try{
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price_data: { currency: 'usd', product_data: { name: product.title }, unit_amount: unitAmount }, quantity: quantity||1 }],
      success_url: SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: SUCCESS_URL + '?canceled=true'
    });
    res.json({ sessionId: session.id });
  }catch(err){ console.error('stripe err', err); res.status(500).json({ error: 'stripe_error', details: err.message }); }
});

app.get('/api/exclusive', async (req, res) => {
  const auth = req.headers.authorization || '';
  if(!auth.startsWith('Bearer ')) return res.status(401).json({ error:'missing token' });
  const token = auth.split(' ')[1];
  try{
    jwt.verify(token, JWT_SECRET);
  }catch(e){ return res.status(401).json({ error:'invalid token' }); }
  const cfg = await readConfig();
  if(!cfg.exclusiveEnabled) return res.status(403).json({ error:'exclusive-disabled' });
  return res.json({ products: cfg.exclusiveProducts });
});

// Admin endpoints require a simple admin key header: x-admin-key
function requireAdmin(req, res, next){
  const key = req.headers['x-admin-key'];
  if(!key || key !== ADMIN_KEY) return res.status(401).json({ error:'unauthorized' });
  next();
}

app.get('/api/admin/settings', requireAdmin, async (req, res) => {
  const cfg = await readConfig();
  res.json({ exclusiveEnabled: cfg.exclusiveEnabled, exclusiveProducts: cfg.exclusiveProducts });
});

app.put('/api/admin/settings', requireAdmin, async (req, res) => {
  const { exclusiveEnabled, password, exclusiveProducts } = req.body || {};
  const cfg = await readConfig();
  if(typeof exclusiveEnabled === 'boolean') cfg.exclusiveEnabled = exclusiveEnabled;
  if(Array.isArray(exclusiveProducts)) cfg.exclusiveProducts = exclusiveProducts;
  if(password){
    const hash = await bcrypt.hash(password, 10);
    cfg.passwordHash = hash;
  }
  await writeConfig(cfg);
  res.json({ ok:true });
});

app.listen(PORT, async ()=>{
  await ensureConfig();
  console.log('QREW portal API running on port', PORT);
});
