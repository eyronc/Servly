import db from '../db.js';

// GET /api/sessions — active sessions (heartbeat within 3 min)
export const getSessions = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM table_sessions WHERE last_seen_at > NOW() - INTERVAL 3 MINUTE ORDER BY table_number'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
};

// POST /api/sessions — register or update a session's table
export const upsertSession = async (req, res) => {
  const { session_id, table_number } = req.body;
  if (!session_id || !table_number) {
    return res.status(400).json({ error: 'session_id and table_number are required' });
  }
  try {
    await db.query(
      `INSERT INTO table_sessions (session_id, table_number, last_seen_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE table_number = ?, last_seen_at = NOW()`,
      [session_id, parseInt(table_number, 10), parseInt(table_number, 10)]
    );
    res.json({ message: 'Session registered', session_id, table_number });
  } catch (error) {
    console.error('Error upserting session:', error);
    res.status(500).json({ error: 'Failed to register session' });
  }
};

// POST /api/sessions/leave — remove session (called via sendBeacon on tab close or manual clear)
export const leaveSession = async (req, res) => {
  const session_id = req.body.session_id || req.query.session_id;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });
  try {
    await db.query('DELETE FROM table_sessions WHERE session_id = ?', [session_id]);
    res.json({ message: 'Session removed' });
  } catch (error) {
    console.error('Error removing session:', error);
    res.status(500).json({ error: 'Failed to remove session' });
  }
};

// POST /api/sessions/heartbeat — keep session alive
export const heartbeat = async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });
  try {
    await db.query(
      'UPDATE table_sessions SET last_seen_at = NOW() WHERE session_id = ?',
      [session_id]
    );
    res.json({ message: 'ok' });
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    res.status(500).json({ error: 'Failed to update heartbeat' });
  }
};
