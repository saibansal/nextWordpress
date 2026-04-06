import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Replace with your actual Env Variable names if they differ
  const wpUrl = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!wpUrl || !consumerKey || !consumerSecret) {
    return res.status(500).json({ 
      message: 'WooCommerce API credentials are not configured in environment variables.' 
    });
  }

  try {
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    let response;
    if (req.method === 'POST') {
      response = await fetch(`${wpUrl.replace(/\/$/, '')}/wp-json/wc/v3/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify(req.body),
      });
    } else {
      // Handle GET Request (Admin Fetch)
      const queryParams = new URLSearchParams();
      Object.entries(req.query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else if (value !== undefined) {
          queryParams.append(key, value);
        }
      });
      const searchString = queryParams.toString();
      const url = `${wpUrl.replace(/\/$/, '')}/wp-json/wc/v3/orders${searchString ? `?${searchString}` : ''}`;
      
      response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Basic ${credentials}` }
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create order in WooCommerce');
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('WooCommerce Order Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}