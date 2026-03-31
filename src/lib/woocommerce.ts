import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL || "http://localhost/wordpress/wordpress-backend/",
  consumerKey: process.env.WC_CONSUMER_KEY || "ck_ce687056501d07d1c225839783c72f6195a545ea",
  consumerSecret: process.env.WC_CONSUMER_SECRET || "cs_86e075205c0edb94ff51ef47430c3127f6b0660b",
  version: "wc/v3",
});
export default api;