const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const api = new WooCommerceRestApi({
  url: "https://dev.vismaad.com/estore",
  consumerKey: "ck_503b97b92ad5cfd943b0f3c682b47bb4953f5820",
  consumerSecret: "cs_463aaf46f6661b151c9126757ce1e4c1a2d4ab92",
  version: "wc/v3",
  queryStringAuth: false,
  axiosConfig: {
    httpsAgent: new (require('https').Agent)({
      rejectUnauthorized: false
    })
  }
});

api.get("products", { per_page: 1 })
  .then((response) => {
    console.log("SUCCESS:", response.data[0]?.name || "No products found");
    process.exit(0);
  })
  .catch((error) => {
    console.error("FAILURE:", error.response?.data || error.message);
    process.exit(1);
  });
