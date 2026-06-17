import db from '../db.js';

// GET /api/settings — returns all settings as a flat key/value object
export const getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT `key`, value FROM settings');
    const settings = {};
    rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
};

// PUT /api/settings/:key — upserts a setting value
export const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined || value === null) {
    return res.status(400).json({ error: 'value is required' });
  }

  try {
    await db.query(
      'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      [key, String(value), String(value)]
    );
    res.json({ message: 'Setting updated', key, value: String(value) });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};
