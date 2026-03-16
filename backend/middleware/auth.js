
import { supabase } from '../server.js';

/**
 * JWT verification using Supabase Auth.
 * Expects header: Authorization: Bearer <access_token>
 */
export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = data.user;
  supabase.auth.setAuth(token); // enables RLS for subsequent queries
  next();
}
