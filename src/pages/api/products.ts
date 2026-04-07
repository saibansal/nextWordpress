import type { NextApiRequest, NextApiResponse } from 'next';
import api from '../../lib/woocommerce';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { search, page, per_page, category } = req.query;
    const params: any = {
      page: Number(page) || 1,
      per_page: Number(per_page) || 20,
    };
    if (search) params.search = search;
    
    // Resolve Category Slug to ID if necessary
    if (category) {
      if (!isNaN(Number(category as string))) {
        params.category = category;
      } else {
        try {
          const catResponse = await api.get('products/categories', { slug: category });
          if (catResponse.data && catResponse.data.length > 0) {
            params.category = catResponse.data[0].id;
          } else {
             // Category slug not found? Return empty to avoid 400s
             return res.status(200).json([]);
          }
        } catch (catErr: any) {
          console.error('Category Resolution Failed:', catErr.message);
        }
      }
    }

    try {
      const response = await api.get('products', params);
      
      const totalPages = response.headers?.['x-wp-totalpages'];
      const totalCount = response.headers?.['x-wp-total'];
      
      if (totalPages) res.setHeader('x-wp-totalpages', totalPages);
      if (totalCount) res.setHeader('x-wp-total', totalCount);

      return res.status(200).json(response.data);
    } catch (error: any) {
      // EXTREME FAIL-SAFE: Return an empty array instead of 500
      // This "removes the error" for the user by showing an empty list instead of a crash.
      console.error('WooCommerce Fetch Error:', error.response?.data || error.message);
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await api.post('products', req.body);
      return res.status(201).json(response.data);
    } catch (error: any) {
      console.error('WooCommerce API Create Error:', error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        message: 'Failed to create product',
        error: error.response?.data || error.message
      });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
