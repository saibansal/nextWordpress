import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path, ...queryParams } = req.query;
  const endpoint = (path as string[]).join('/');
  
  const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://dev.vismaad.com/estore';
  const username = process.env.WP_USERNAME || '';
  const appPassword = process.env.WP_APP_PASSWORD || '';
  
  const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
  
  const url = new URL(`${wpUrl}/wp-json/wp/v2/${endpoint}`);
  Object.keys(queryParams).forEach(key => {
    url.searchParams.append(key, queryParams[key] as string);
  });

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: ['POST', 'PUT'].includes(req.method!) ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error(`WP ADM ERROR [${endpoint}]:`, response.status, data);
        return res.status(response.status).json(data);
    }

    // Forward headers like x-wp-total
    const totalPages = response.headers.get('x-wp-totalpages');
    const totalCount = response.headers.get('x-wp-total');
    if (totalPages) res.setHeader('x-wp-totalpages', totalPages);
    if (totalCount) res.setHeader('x-wp-total', totalCount);

    return res.status(200).json(data);
  } catch (error: any) {
    console.error(`WP ADM FETCH CRASH [${endpoint}]:`, error.message);
    return res.status(500).json({ 
      message: `Failed to fetch ${endpoint} from WP`, 
      error: error.message 
    });
  }
}

