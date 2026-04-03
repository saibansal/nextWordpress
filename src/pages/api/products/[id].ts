import type { NextApiRequest, NextApiResponse } from 'next';
import api from '../../../lib/woocommerce';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const response = await api.get(`products/${id}`);
      return res.status(200).json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status || 500;

      console.error('--- WC API ERROR (Product) ---');
      console.error('URL: products/${id}');
      console.error('Status:', status);
      console.error('Error Data:', errorData || error.message);
      console.error('--------------------------------');

      return res.status(status).json({
        message: 'Failed to fetch product',
        error: errorData || error.message
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}