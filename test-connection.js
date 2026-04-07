
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const dotenv = require("dotenv");
const https = require('https');

// Load env
dotenv.config();
dotenv.config({ path: '.env.local' });

const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://localhost/wordpress/wordpress-backend";
const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;

console.log("Testing WooCommerce Connection...");
console.log("URL:", wpUrl);
console.log("Consumer Key Present:", !!consumerKey);
console.log("Consumer Secret Present:", !!consumerSecret);

if (!consumerKey || !consumerSecret) {
    console.error("ERROR: Missing WooCommerce Credentials in .env");
    process.exit(1);
}

const api = new WooCommerceRestApi({
  url: wpUrl,
  consumerKey: consumerKey,
  consumerSecret: consumerSecret,
  version: "wc/v3",
  queryStringAuth: true,
  axiosConfig: {
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
  }
});

api.get("products", { per_page: 5 })
  .then((response) => {
    console.log("SUCCESS! Retrieved", response.data.length, "products.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("CONNECTION FAILED!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Message:", error.message);
    }
    process.exit(1);
  });
