import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import https from 'https';

const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://localhost/wordpress/wordpress-backend",
  consumerKey: process.env.WC_CONSUMER_KEY || "",
  consumerSecret: process.env.WC_CONSUMER_SECRET || "",
  version: "wc/v3",
  queryStringAuth: true, // Forces credentials to be sent in the URL (More compatible for HTTP)
  axiosConfig: {
    headers: {
      "Content-Type": "application/json",
    },
    // Proper way to ignore self-signed certificates or SSL issues during dev
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
  }
});

export default api;