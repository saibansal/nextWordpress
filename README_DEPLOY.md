# Deployment Guide: Next.js + WooCommerce (XAMPP/Vercel)

Your project is structured to handle both local development (XAMPP) and production (Vercel).

## 🚀 1. Local Development (Dev)
Use `.env.development` (Localhost XAMPP).

1. Ensure WordPress is running on `http://localhost/wordpress/wordpress-backend`.
2. Ensure you have the following in `wp-config.php`:
   ```php
   define('WP_ENVIRONMENT_TYPE', 'local');
   ```
3. Run `npm run dev`.

## 🌍 2. Production Deployment (Vercel)
Vercel requires the same environment variables, but they must point to your live site.

1. Go to **Vercel Project Settings > Environment Variables**.
2. Add the following keys (DO NOT use `NEXT_PUBLIC_` for Consumer Secret!):
   - `NEXT_PUBLIC_WORDPRESS_URL`: Your live site URL (e.g., `https://yourdomain.com`).
   - `WC_CONSUMER_KEY`: From WooCommerce API settings (Read/Write).
   - `WC_CONSUMER_SECRET`: From WooCommerce API settings.
   - `WP_USERNAME`: Your WordPress admin username.
   - `WP_APP_PASSWORD`: Your generated Application Password.
3. Deploy.

## ⚠️ 🖥️ Critical Fix: Client-Side Exceptions
If you see **"OptionsException: consumerKey is required"**, it is because your code is trying to use the WooCommerce library directly in the browser. 

**SECURITY WARNING**: Never expose your `consumerSecret` to the browser by using `NEXT_PUBLIC_`. This project uses a built-in proxy. Instead of:
```ts
import api from '../../lib/woocommerce'; // ❌ WRONG (Client Side)
api.get('products');
```
Use:
```ts
const res = await fetch('/api/wc/products'); // ✅ CORRECT (Client Side)
```
I am currently updating your dashboard pages to use this secure method.
