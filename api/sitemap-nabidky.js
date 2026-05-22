// Vercel serverless function — dynamický sitemap pro nabídky nemovitostí
// Generuje XML sitemap se všemi aktivními a rezervovanými nemovitostmi
// dostupný na /sitemap-nabidky.xml (přes Vercel rewrite v vercel.json)

const BACKEND = process.env.PTF_BACKEND_URL || 'https://ptf-production.up.railway.app';
const TENANT  = process.env.PTF_TENANT_SLUG || 'ptf-reality';
const SITE    = 'https://www.davidchoc.cz';

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  })[c]);
}

function emptyXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    // Fetch all active + reserved properties (max 500 per call)
    const upstream = await fetch(
      `${BACKEND}/api/properties?status=active,reserved&limit=500`,
      {
        headers: {
          'X-Tenant-Slug': TENANT,
          'Accept': 'application/json',
        },
      }
    );

    if (!upstream.ok) {
      console.error('PTF backend error for sitemap:', upstream.status);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=60');
      return res.status(200).send(emptyXml());
    }

    const json = await upstream.json();
    const properties = (json.data || []).filter(p => p && p.slug);

    const urlEntries = properties.map(p => {
      const dateSrc = p.updated_at || p.created_at || new Date().toISOString();
      const lastmod = String(dateSrc).slice(0, 10);
      const slug = escapeXml(p.slug);
      // Prioritu mírně zvedneme pro aktivní oproti rezervovaným
      const priority = p.status === 'aktivni' || p.status === 'active' ? '0.85' : '0.65';

      // Image extension — zahrnuje hlavní obrázek a několik dalších
      const images = (p.images || [])
        .filter(img => img && img.is_visible !== false && (img.url || img.url_thumbnail))
        .sort((a, b) => {
          // Hlavní fotka první, pak podle sort_order
          if (a.is_main && !b.is_main) return -1;
          if (!a.is_main && b.is_main) return 1;
          return (a.sort_order || 0) - (b.sort_order || 0);
        })
        .slice(0, 5); // max 5 obrázků per URL

      const imageEntries = images.map(img => {
        const imgUrl = escapeXml(img.url || img.url_thumbnail);
        const imgTitle = escapeXml(p.title || 'Nemovitost');
        return `    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${imgTitle}</image:title>
    </image:image>`;
      }).join('\n');

      return `  <url>
    <loc>${SITE}/nabidky/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
${imageEntries ? imageEntries + '\n' : ''}  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>
`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Cache 10 min na edge, 1 h stale-while-revalidate
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap-nabidky error:', err);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(200).send(emptyXml());
  }
}
