export function createAuthMiddleware(supabase) {
  return async function authMiddleware(req, res, next) {
    // Auth is opt-in: set AUTH_ENABLED=true to require valid tokens
    if (process.env.AUTH_ENABLED !== 'true') {
      req.user = null;
      return next();
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}