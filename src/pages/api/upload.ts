import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { file, name, type } = req.body;
  if (!file || !name) {
    return res.status(400).json({ message: 'Missing file or name' });
  }

  try {
    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost/wordpress/wordpress-backend';
    const ck = process.env.WC_CONSUMER_KEY;
    const cs = process.env.WC_CONSUMER_SECRET;
    const wpUser = process.env.WP_USERNAME || 'admin';
    const wpPass = process.env.WP_APP_PASSWORD;

    const base64Data = file.split(';base64,').pop();
    if (!base64Data) throw new Error('Invalid base64 data');
    const buffer = Buffer.from(base64Data, 'base64');

    const mediaEndpoint = `${wpUrl}/wp-json/wp/v2/media`;

    console.log(`[Upload API Exec] Posting binary media to ${mediaEndpoint}`);

    // If we have an Application Password, use it as it's more reliable for Core WP (Media)
    // Otherwise fall back to WC keys
    let authHeader = '';
    if (wpPass) {
        authHeader = `Basic ${Buffer.from(`${wpUser}:${wpPass}`).toString('base64')}`;
        console.log(`[Upload API Auth] Using Application Password for ${wpUser}`);
    } else {
        authHeader = `Basic ${Buffer.from(`${ck}:${cs}`).toString('base64')}`;
        console.log(`[Upload API Auth] Using WooCommerce Keys`);
    }

    const response = await axios.post(mediaEndpoint, buffer, {
      params: {
          consumer_key: ck,
          consumer_secret: cs
      },
      headers: {
        'Content-Type': type || 'image/webp',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Authorization': authHeader
      },
      // Ensure we don't fail due to SSL cert issues on local dev
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });

    console.log(`[Upload API Success] Media ID: ${response.data.id}`);

    return res.status(201).json({
      id: response.data.id,
      source_url: response.data.source_url
    });

  } catch (error: any) {
    const status = error.response?.status;
    const body = error.response?.data;

    console.error(`[Upload API Error] ${status || 500}:`, JSON.stringify(body || error.message));

    // Handle 401 specifically for user feedback
    if (status === 401) {
      return res.status(401).json({
        message: 'WordPress rejected the Credentials (401).',
        troubleshooting: [
          'Ensure your API Key has "Read/Write" permissions.',
          'Verify you are an "Administrator" in WordPress.',
          'Check if your username/password in .env is correct.'
        ],
        error: body
      });
    }

    return res.status(status || 500).json({
      message: `Media upload failed: ${body?.message || error.message}`,
      error: body
    });
  }
}
