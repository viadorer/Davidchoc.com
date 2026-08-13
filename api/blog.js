// Vercel serverless function — proxy na PTF backend pro výpis blogu.
// Volá: GET /api/blog
// Backend: GET /api/blog?web=davidchoc s headerem X-Tenant-Slug
//
// PROČ PROXY A NE PŘÍMÉ VOLÁNÍ: stejný vzor jako /api/properties —
// tenant hlavička zůstává na serveru a odpověď se cachuje na hraně.
//
// PROČ SE TU MAPUJE: výpis blogu (blog.html) byl léta stavěný na tvar
// blog/posts.json. Mapování na týž tvar tady znamená, že se v render
// kódu neměnilo nic — a vzhled i chování výpisu zůstaly 1:1.

const BACKEND = process.env.PTF_BACKEND_URL || 'https://ptf-production.up.railway.app';
const TENANT  = process.env.PTF_TENANT_SLUG || 'ptf-reality';
const WEB     = 'davidchoc';

// Filtr kategorií na výpisu pracuje s klíči z původního posts.json.
// PTF vrací české názvy kategorií — převod drží filtr funkční.
const KATEGORIE_KLICE = {
  'trh & finance': 'market',
  'tipy & triky': 'tips',
  'tipy': 'tips',
  'investice': 'investment',
  'právní rady': 'legal',
  'právní záležitosti': 'legal',
  'renovace': 'renovation',
  'průvodce': 'guide',
  'hypotéky a finance': 'market',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const upstream = await fetch(`${BACKEND}/api/blog?web=${WEB}&limit=50`, {
      headers: { 'X-Tenant-Slug': TENANT, Accept: 'application/json' },
    });
    if (!upstream.ok) {
      console.error('PTF backend error:', upstream.status);
      return res.status(502).json({ error: 'Backend nedostupný' });
    }
    const data = await upstream.json();

    const posts = (data.data || []).map(p => {
      const datum = p.publishedAt || p.createdAt || null;
      const nazevKategorie = p.category?.name || '';
      return {
        id: p.slug,
        slug: p.slug,
        date: datum ? datum.slice(0, 10) : null,
        dateFormatted: datum
          ? new Date(datum).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })
          : '',
        title: p.title,
        excerpt: p.excerpt || '',
        image: p.featuredImageUrl || null,
        imageAlt: p.featuredImageAlt || p.title,
        category: KATEGORIE_KLICE[nazevKategorie.toLowerCase()] || 'other',
        categoryName: nazevKategorie,
        readTime: p.readingTimeMinutes || null,
        featured: false,
      };
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('Blog proxy error:', err?.message);
    return res.status(502).json({ error: 'Backend nedostupný' });
  }
}
