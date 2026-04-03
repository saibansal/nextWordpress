import type { NextApiRequest, NextApiResponse } from 'next';
import api from '../../lib/woocommerce';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { search, page, per_page } = req.query;
    const params: any = {
      page: page || 1,
      per_page: per_page || 20,
    };
    if (search) params.search = search;

    try {
      const response = await api.get('products', params);
      
      const totalPages = response.headers?.['x-wp-totalpages'];
      const totalCount = response.headers?.['x-wp-total'];
      
      if (totalPages) res.setHeader('x-wp-totalpages', totalPages);
      if (totalCount) res.setHeader('x-wp-total', totalCount);

      return res.status(200).json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status || 500;
      
      console.error('--- WC API ERROR (Products) ---');
      console.error('URL: products');
      console.error('Params:', params);
      console.error('Status:', status);
      
      if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE')) {
        console.error('Response is HTML (Potential Server Error)');
      } else {
        console.error('Error Data:', errorData || error.message);
      }
      console.error('--------------------------------');

      return res.status(status).json({
        message: 'Failed to fetch products',
        error: errorData || error.message,
        isHtml: typeof errorData === 'string' && errorData.includes('<!DOCTYPE')
      });
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
