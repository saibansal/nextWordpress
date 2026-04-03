import type { NextApiRequest, NextApiResponse } from 'next';
import api, { wpApi } from '../../../lib/woocommerce';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path, ...queryParams } = req.query;
  const pathArray = path as string[];
  const isWp = pathArray[0] === 'wp';
  
  // Choose the right API instance
  const activeApi = isWp ? wpApi : api;
  
  // For WP API, the endpoint is the part after /wp
  const endpoint = isWp 
    ? pathArray.slice(1).join('/')
    : Array.isArray(path)? path.join('/') : path;

  try {
    let response;

    switch (req.method) {
      case 'GET':
        response = await activeApi.get(endpoint, queryParams);
        break;
      case 'POST':
        response = await activeApi.post(endpoint, req.body);
        break;
      case 'PUT':
        response = await activeApi.put(endpoint, req.body);
        break;
      case 'DELETE':
        response = await activeApi.delete(endpoint, queryParams);
        break;
      default:
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Forward pagination headers
    const totalPages = response.headers?.['x-wp-totalpages'];
    const totalCount = response.headers?.['x-wp-total'];
    if (totalPages) res.setHeader('x-wp-totalpages', totalPages);
    if (totalCount) res.setHeader('x-wp-total', totalCount);

    return res.status(response.status || 200).json(response.data);
  } catch (error: any) {
    const errorData = error.response?.data;
    const status = error.response?.status || 500;
    
    console.error(`--- WC PROXY ERROR [${req.method} ${endpoint}] ---`);
    console.error('Status:', status);
    
    if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE')) {
      console.error('Response is HTML (Potential Server Error)');
    } else {
      console.error('Error Data:', errorData || error.message);
    }
    console.error('------------------------------------------');

    return res.status(status).json({
      message: `Failed to ${req.method} ${endpoint}`,
      error: errorData || error.message,
      isHtml: typeof errorData === 'string' && errorData.includes('<!DOCTYPE')
    });
  }
}
