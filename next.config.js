/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.paypal.com; frame-src 'self' https://js.stripe.com https://www.paypal.com; connect-src 'self' https: wss: ws:;"
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;