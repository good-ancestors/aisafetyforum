# Stripe Configuration Complete! ✅

I've created your Stripe products and prices:

## Products Created:

1. **Standard Ticket** - $595 AUD
   - Price ID: `price_1SrWuIBci50XsyjXhSrOLfXg`

2. **Academic Ticket** - $395 AUD
   - Price ID: `price_1SrWuSBci50XsyjXrxrKcNsr`

3. **Concession Ticket** - $195 AUD
   - Price ID: `price_1SrWueBci50XsyjXyQaSHYna`

## Next Steps:

### 1. Get your API keys

Visit: https://dashboard.stripe.com/test/apikeys

Copy these values:
- **Publishable key** (starts with `pk_test_`)
- **Secret key** (starts with `sk_test_`) - click "Reveal test key token"

### 2. Update your .env file

Add these lines to your `.env` file (replace with your actual keys):

```bash
# Stripe API Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY_HERE"

# Stripe Product Price IDs (already created for you!)
STRIPE_PRICE_STANDARD="price_1SrWuIBci50XsyjXhSrOLfXg"
STRIPE_PRICE_ACADEMIC="price_1SrWuSBci50XsyjXrxrKcNsr"
STRIPE_PRICE_CONCESSION="price_1SrWueBci50XsyjXyQaSHYna"

# Application URLs
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Remove the skip validation flag

Comment out or remove this line from `.env`:
```bash
# SKIP_STRIPE_VALIDATION="true"
```

### 4. Restart your dev server

```bash
# Kill the current server
# Then restart:
npm run dev
```

## Testing Payments

Use these test card numbers in Stripe checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

## View Products in Dashboard

https://dashboard.stripe.com/test/products

You can see all your products and prices there!
