import type { NextApiRequest, NextApiResponse } from 'next';
import api from '../../../lib/woocommerce';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { search, page, per_page, category, location } = req.query;
    const params: any = {
      page: Number(page) || 1,
      per_page: Number(per_page) || 100, // Fetch more to allow for filtering
    };
    if (search) params.search = search;
    
    // SAFE RESOLUTION: WooCommerce doesn't support category slugs, only IDs.
    if (category) {
      if (!isNaN(Number(category as string))) {
        params.category = category;
      } else {
        try {
          const catResponse = await api.get('products/categories', { slug: category });
          if (catResponse.data && catResponse.data.length > 0) {
            params.category = catResponse.data[0].id;
          } else {
             return res.status(200).json([]);
          }
        } catch (catErr: any) {
          console.error('[WP] Category resolution failed:', catErr.message);
        }
      }
    }

    try {
      const response = await api.get('products', params);
      let products = response.data;

      // SERVER-SIDE LOCATION FILTERING
      if (location) {
        const targetId = String(location);
        products = products.filter((p: any) => {
          const locMeta = (p.meta_data || []).find((m: any) => m.key === '_sakoon_locations');
          
          // If no location meta exists, treat as Global (visible everywhere)
          if (!locMeta || !locMeta.value || !Array.isArray(locMeta.value) || locMeta.value.length === 0) {
            return true;
          }
          
          // Match the location ID (handles both string and number comparisons)
          return locMeta.value.some((id: any) => String(id) === targetId);
        });
      }
      
      const totalPages = response.headers?.['x-wp-totalpages'];
      const totalCount = response.headers?.['x-wp-total'];
      
      if (totalPages) res.setHeader('x-wp-totalpages', totalPages);
      if (totalCount) res.setHeader('x-wp-total', totalCount);

      // Prevent browsers from aggressively caching the JSON response
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      return res.status(200).json(products);
    } catch (error: any) {
      const errorData = error.response?.data;
      const status = error.response?.status || 500;
      console.error(`--- WC API ERROR [GET products] ---`, status, errorData || error.message);
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
