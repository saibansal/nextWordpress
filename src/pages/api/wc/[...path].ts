import type { NextApiRequest, NextApiResponse } from 'next';
import api from '../../../lib/woocommerce';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path, ...queryParams } = req.query;
  const endpoint = (path as string[]).join('/');

  if (req.method === 'GET') {
    try {
      const response = await api.get(endpoint, queryParams);
      const totalPages = response.headers?.['x-wp-totalpages'];
      const totalCount = response.headers?.['x-wp-total'];
      
      if (totalPages) res.setHeader('x-wp-totalpages', totalPages);
      if (totalCount) res.setHeader('x-wp-total', totalCount);

      return res.status(200).json(response.data);
    } catch (error: any) {
      console.error(`WC GET ERROR [${endpoint}]:`, error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        message: `Failed to fetch ${endpoint} from ${endpoint}`,
        error: error.response?.data || error.message
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const response = await api.post(endpoint, req.body);
      return res.status(201).json(response.data);
    } catch (error: any) {
      return res.status(error.response?.status || 500).json({
        message: `Failed to create ${endpoint}`,
        error: error.response?.data || error.message
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const response = await api.put(endpoint, req.body);
      return res.status(200).json(response.data);
    } catch (error: any) {
      console.error(`WC Update Error [${endpoint}]:`, error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        message: `Failed to update ${endpoint}`,
        error: error.response?.data || error.message
      });
    }
  }

  if (req.method === 'DELETE') {
      try {
          const response = await api.delete(endpoint, req.query);
          return res.status(200).json(response.data);
      } catch (error: any) {
          console.error(`WC Delete Error [${endpoint}]:`, error.response?.data || error.message);
          return res.status(error.response?.status || 500).json({
              message: `Failed to delete ${endpoint}`,
              error: error.response?.data || error.message
          });
      }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
