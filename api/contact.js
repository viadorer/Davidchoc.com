export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message, formType } = req.body;

  if (!name || (!email && !phone) || !message) {
    return res.status(400).json({ error: 'Chybí povinná pole (jméno, email nebo telefon, zpráva)' });
  }

  try {
    const realvisorApiKey = process.env.REALVISOR_API_KEY;

    if (!realvisorApiKey) {
      console.error('Realvisor API key není nastaven');
      return res.status(500).json({ error: 'Konfigurace serveru není kompletní' });
    }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const pipeline = formType === 'newsletter' ? 'newsletter-prih-96266' : 'kontaktni-formu-87433';

    const response = await fetch('https://api-production-88cf.up.railway.app/api/v1/public/api-leads/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': realvisorApiKey,
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email: email || '',
        phone: phone || '',
        message,
        data: {
          source: 'davidchoc.com',
          formType: formType || 'contact',
          pipeline,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Realvisor API error:', response.status, errorText);
      return res.status(500).json({ error: 'Nepodařilo se odeslat zprávu' });
    }

    const data = await response.json();

    return res.status(200).json({ 
      success: true,
      message: 'Zpráva byla úspěšně odeslána',
      leadId: data.leadId,
      contactId: data.contactId,
    });

  } catch (error) {
    console.error('Error sending to Realvisor:', error);
    return res.status(500).json({ error: 'Došlo k chybě při odesílání zprávy' });
  }
}
