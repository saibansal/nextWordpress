import type { NextApiRequest, NextApiResponse } from 'next';
import api from '../../lib/woocommerce';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { search, page, per_page } = req.query;

  try {
    const params: any = {
      page: page || 1,
      per_page: per_page || 20,
    };

    if (search) {
      params.search = search;
    }

    const response = await api.get('products', params);
    
    // Pass along headers like total pages and total products
    const totalPages = response.headers?.['x-wp-totalpages'];
    const totalCount = response.headers?.['x-wp-total'];
    
    if (totalPages) res.setHeader('x-wp-totalpages', totalPages);
    if (totalCount) res.setHeader('x-wp-total', totalCount);

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('WooCommerce API Proxy Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      message: 'Failed to fetch products from WooCommerce',
      error: error.response?.data || error.message
    });
  }
}
