const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const api = new WooCommerceRestApi({
  url: "https://dev.vismaad.com/estore",
  consumerKey: "ck_68e7bd4d20786d47277d0deb4df9507f03367bd6",
  consumerSecret: "cs_b06f9e36ae325e90b30c965461452d13297c7409",
  version: "wc/v3",
  queryStringAuth: true,
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
