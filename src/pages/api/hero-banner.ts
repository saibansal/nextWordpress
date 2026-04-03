import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Check if there's localStorage data (for admin management)
      // Note: This is a simplified approach. In production, use WordPress ACF or custom fields

      // Try to fetch from WordPress first
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://dev.vismaad.com/estore';
      const username = process.env.WP_USERNAME || '';
      const appPassword = process.env.WP_APP_PASSWORD || '';

      let heroData = {
        title: 'CELEBRATING INDIAN FLAVOURS',
        subtitle: 'A Culinary Journey Through India',
        backgroundImage: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp',
        ctaText: 'Explore Our Menu',
        ctaLink: '/sakoon/menu'
      };

      if (wpUrl && username && appPassword && !wpUrl.includes('localhost')) {
        try {
          const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
          const url = `${wpUrl}/wp-json/wp/v2/pages?slug=sakoon-home-hero&_fields=id,title,content,meta`;

          const response = await fetch(url, {
            headers: {
              'Authorization': `Basic ${auth}`,
            },
          });

          if (response.ok) {
            const pages = await response.json();
            if (pages.length > 0) {
              const page = pages[0];
              // Use meta data if available
              if (page.meta) {
                heroData = {
                  title: page.meta.hero_title?.[0] || heroData.title,
                  subtitle: page.meta.hero_subtitle?.[0] || heroData.subtitle,
                  backgroundImage: page.meta.hero_background_image?.[0] || heroData.backgroundImage,
                  ctaText: page.meta.hero_cta_text?.[0] || heroData.ctaText,
                  ctaLink: page.meta.hero_cta_link?.[0] || heroData.ctaLink,
                };
              }
            }
          }
        } catch (wpError) {
          console.warn('WordPress fetch failed, using defaults:', wpError);
        }
      }

      return res.status(200).json(heroData);

    } catch (error: any) {
      console.error('Error fetching hero banner:', error);
      return res.status(200).json({
        title: 'CELEBRATING INDIAN FLAVOURS',
        subtitle: 'A Culinary Journey Through India',
        backgroundImage: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp',
        ctaText: 'Explore Our Menu',
        ctaLink: '/sakoon/menu'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}