export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, email, company } = req.body || {};

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Name, phone, and email are required.' });
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = '31963e92-d17b-81c2-acb2-da3dc2fbdf8b';

  const payload = {
    parent: { database_id: DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: name } }] },
      Phone: { phone_number: phone },
      Email: { email: email },
      Company: { rich_text: [{ text: { content: company || '' } }] },
      'Submitted At': { date: { start: new Date().toISOString() } },
    },
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error('Notion error:', err);
    return res.status(500).json({ error: 'Failed to save. Please try again.' });
  }

  return res.status(200).json({ success: true });
}
