import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import https from 'https';

const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;

if (!wpUrl) {
    console.warn("WARNING: NEXT_PUBLIC_WORDPRESS_URL is not defined in .env. Falling back to localhost.");
}

const api = new WooCommerceRestApi({
  url: wpUrl || "http://localhost/wordpress/wordpress-backend",
  consumerKey: process.env.WC_CONSUMER_KEY || "",
  consumerSecret: process.env.WC_CONSUMER_SECRET || "",
  version: "wc/v3",
  queryStringAuth: true,
  axiosConfig: {
    headers: {
      "Content-Type": "application/json",
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
  }
});

// Create a separate instance for WP REST API calls
const wpAuth = process.env.WP_APP_PASSWORD 
  ? { Authorization: `Basic ${Buffer.from(`${process.env.WP_USERNAME}:${process.env.WP_APP_PASSWORD}`).toString('base64')}` }
  : {};

export const wpApi = new WooCommerceRestApi({
  url: wpUrl || "http://localhost/wordpress/wordpress-backend",
  consumerKey: process.env.WC_CONSUMER_KEY || "",
  consumerSecret: process.env.WC_CONSUMER_SECRET || "",
  version: "wp/v2",
  queryStringAuth: true,
  axiosConfig: {
    headers: {
      "Content-Type": "application/json",
      ...wpAuth
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
  }
});

export default api;