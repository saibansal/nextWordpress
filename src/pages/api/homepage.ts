import type { NextApiRequest, NextApiResponse } from 'next';

interface HomepageData {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  };
  welcome: {
    title: string;
    description: string;
    image: string;
    bottomText: string;
  };
}

interface LocationHomepageData {
  [locationId: string]: HomepageData;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { location } = req.query;
  const locationId = location as string || 'default';

  if (req.method === 'GET') {
    try {
      // Default data for all locations
      let locationHomepages: LocationHomepageData = {
        default: {
          hero: {
            title: 'CELEBRATING INDIAN FLAVOURS',
            subtitle: 'A Culinary Journey Through India',
            backgroundImage: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp',
            ctaText: 'Explore Our Menu',
            ctaLink: '/sakoon/menu'
          },
          welcome: {
            title: 'Welcome to Sakoon',
            description: 'Sakoon invites you on a culinary journey that transcends borders and awakens your senses. Step into a world of opulence and flavor, where timeless traditions of Indian cuisine blend seamlessly with contemporary elegance at four locations in the Bay Area.',
            image: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp',
            bottomText: 'At Sakoon, we have mastered the art of Indian fine dining, curating a menu that showcases the finest culinary treasures from across the subcontinent. Each dish is a symphony of flavors, meticulously prepared by our skilled chefs, using the freshest locally sourced produce and the exotic spices from India.'
          }
        },
        '1': { // Fremont
          hero: {
            title: 'CELEBRATING INDIAN FLAVOURS - FREMONT',
            subtitle: 'A Culinary Journey Through India',
            backgroundImage: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp',
            ctaText: 'Explore Our Menu',
            ctaLink: '/sakoon/menu'
          },
          welcome: {
            title: 'Welcome to Sakoon Fremont',
            description: 'Experience authentic Indian cuisine at our Fremont location. Sakoon invites you on a culinary journey that transcends borders and awakens your senses in the heart of Fremont.',
            image: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp',
            bottomText: 'At Sakoon Fremont, we have mastered the art of Indian fine dining, curating a menu that showcases the finest culinary treasures from across the subcontinent.'
          }
        },
        '2': { // Santa Clara
          hero: {
            title: 'CELEBRATING INDIAN FLAVOURS - SANTA CLARA',
            subtitle: 'A Culinary Journey Through India',
            backgroundImage: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/santa-clara.webp',
            ctaText: 'Explore Our Menu',
            ctaLink: '/sakoon/menu'
          },
          welcome: {
            title: 'Welcome to Sakoon Santa Clara',
            description: 'Experience authentic Indian cuisine at our Santa Clara location. Sakoon invites you on a culinary journey that transcends borders and awakens your senses in the heart of Silicon Valley.',
            image: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp',
            bottomText: 'At Sakoon Santa Clara, we have mastered the art of Indian fine dining, curating a menu that showcases the finest culinary treasures from across the subcontinent.'
          }
        },
        '3': { // Mountain View
          hero: {
            title: 'CELEBRATING INDIAN FLAVOURS - MOUNTAIN VIEW',
            subtitle: 'A Culinary Journey Through India',
            backgroundImage: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/mountain-view.webp',
            ctaText: 'Explore Our Menu',
            ctaLink: '/sakoon/menu'
          },
          welcome: {
            title: 'Welcome to Sakoon Mountain View',
            description: 'Experience authentic Indian cuisine at our Mountain View location. Sakoon invites you on a culinary journey that transcends borders and awakens your senses in Silicon Valley\'s vibrant dining scene.',
            image: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp',
            bottomText: 'At Sakoon Mountain View, we serve the finest Indian dishes crafted from the freshest local ingredients and exotic spices.'
          }
        }
      };

      let homepageData = locationHomepages[locationId] || locationHomepages.default;

      // Try to fetch from WordPress
      const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://dev.vismaad.com/estore';
      const username = process.env.WP_USERNAME || '';
      const appPassword = process.env.WP_APP_PASSWORD || '';

      if (wpUrl && username && appPassword && !wpUrl.includes('localhost')) {
        try {
          const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');

          // Always use one single canonical homepage in WP
          let url = `${wpUrl}/wp-json/wp/v2/pages?slug=sakoon-homepage&_fields=id,title,content,meta&_embed`;
          console.log('[Homepage API] Fetching homepage page:', url);

          let response = await fetch(url, {
            headers: {
              'Authorization': `Basic ${auth}`,
            },
          });

          // Check if response is JSON before parsing
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.warn('[Homepage API] WordPress returned non-JSON response:', contentType, 'Status:', response.status);
            throw new Error(`WordPress API returned ${contentType} instead of JSON`);
          }

          let pages: any[] = [];
          if (response.ok) {
            pages = await response.json();
          } else {
            console.log('[Homepage API] WordPress request failed:', response.status, response.statusText);
          }

          if (pages.length > 0) {
            const page = pages[0];
            const content = page.content?.rendered || '';
            const dataMatch = content.match(/<!-- HOMEPAGE_DATA ([\s\S]*?) -->/);

            if (dataMatch) {
              try {
                const parsedData = JSON.parse(dataMatch[1]);
                console.log('[Homepage API] Found data in HTML comment:', parsedData);

                if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
                  if (parsedData[locationId]) {
                    homepageData = parsedData[locationId];
                  } else if (parsedData.default) {
                    homepageData = parsedData.default;
                  } else if (parsedData.hero && parsedData.welcome) {
                    homepageData = parsedData as HomepageData;
                  }
                }
              } catch (parseError) {
                console.warn('[Homepage API] Failed to parse data from HTML comment:', parseError);
              }
            }
          } else {
            console.log('[Homepage API] No pages found for homepage slug. Using defaults for location:', locationId);
          }
        } catch (wpError) {
          console.warn('[Homepage API] WordPress fetch failed, using defaults:', wpError);
        }
      }

      // Note: localStorage check is removed here because API routes run on the server 
      // where window and localStorage are not available. Custom data should be managed 
      // via WordPress meta or a database instead.

      return res.status(200).json(homepageData);

    } catch (error: any) {
      console.error('Error fetching homepage data:', error);
      return res.status(200).json({
        hero: {
          title: 'CELEBRATING INDIAN FLAVOURS',
          subtitle: 'A Culinary Journey Through India',
          backgroundImage: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/fremont.webp',
          ctaText: 'Explore Our Menu',
          ctaLink: '/sakoon/menu'
        },
        welcome: {
          title: 'Welcome to Sakoon',
          description: 'Sakoon invites you on a culinary journey that transcends borders and awakens your senses.',
          image: 'https://sakoon.vismaad.com/wp-content/uploads/2026/03/3.webp',
          bottomText: 'At Sakoon, we have mastered the art of Indian fine dining.'
        }
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}