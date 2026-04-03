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
  
  // Check if WordPress is available (skip fetch if localhost and no credentials)
  if (wpUrl.includes('localhost') && !appPassword) {
    console.warn(`[WP API] Skipping localhost request - no credentials configured`);
    return res.status(503).json({ 
      message: 'WordPress backend not configured for local development',
      hint: 'Set WP_USERNAME and WP_APP_PASSWORD in .env.local to connect to a live WordPress instance, or deploy to a server with WordPress running at ' + wpUrl
    });
  }
  
  const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
  
  const url = new URL(`${wpUrl}/wp-json/wp/v2/${endpoint}`);
  Object.keys(queryParams).forEach(key => {
    url.searchParams.append(key, queryParams[key] as string);
  });

  try {
    console.log(`[WP API] Requesting: ${url.toString()}`);
    console.log(`[WP API] Auth: ${username}:****`);
    
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: ['POST', 'PUT'].includes(req.method!) ? JSON.stringify(req.body) : undefined,
    });

    // Check if response is JSON before trying to parse
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[WP API] WordPress returned non-JSON response: ${contentType}, Status: ${response.status}`);
      const textResponse = await response.text();
      console.error(`[WP API] Response body (first 500 chars):`, textResponse.substring(0, 500));
      return res.status(502).json({ 
        message: 'WordPress API returned HTML instead of JSON',
        contentType: contentType,
        status: response.status,
        hint: 'Check WordPress URL and credentials in .env.local'
      });
    }

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
    console.error(`WP URL: ${process.env.NEXT_PUBLIC_WORDPRESS_URL}`);
    console.error(`WP Username: ${process.env.WP_USERNAME}`);
    console.error(`Full Error:`, error);
    return res.status(500).json({ 
      message: `Failed to fetch ${endpoint} from WP`, 
      error: error.message,
      url: url.toString()
    });
  }
}

