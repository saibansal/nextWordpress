import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
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
    // Useful for local dev if SSL is self-signed/missing
    httpsAgent: {
        rejectUnauthorized: false
    }
  }
});
export default api;