import { Router } from 'express';
import { z } from 'zod';

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  full_name: z.string().min(1).max(100),
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function createAuthRouter(supabase) {
  const router = Router();

  router.post('/signup', async (req, res, next) => {
    try {
      const { email, password, full_name } = SignUpSchema.parse(req.body);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name },
        },
      });

      if (error) throw error;

      res.status(201).json({
        user: data.user,
        session: data.session,
        message: 'Check your email for confirmation link',
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
      }
      next(err);
    }
  });

  router.post('/signin', async (req, res, next) => {
    try {
      const { email, password } = SignInSchema.parse(req.body);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      res.json({
        user: data.user,
        session: data.session,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
      }
      next(err);
    }
  });

  router.post('/signout', async (req, res, next) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      res.json({ message: 'Signed out successfully' });
    } catch (err) {
      next(err);
    }
  });

  router.get('/me', async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      res.json({ user, profile });
    } catch (err) {
      next(err);
    }
  });

  router.post('/reset-password', async (req, res, next) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      res.json({ message: 'Password reset email sent' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
