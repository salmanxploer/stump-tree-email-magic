import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, completeOAuthLogin } = useAuth();
  const tokenParam = searchParams.get('token');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      toast.error(errorParam === 'access_denied' ? 'Google sign-in was cancelled.' : errorParam);
      navigate('/login', { replace: true });
    }
  }, [errorParam, navigate]);

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'staff') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/customer/menu', { replace: true });
      }
      return;
    }

    if (tokenParam) {
      completeOAuthLogin(tokenParam).then((result) => {
        if (result.success) {
          // Will redirect via user state change
        } else {
          toast.error(result.message);
          navigate('/login', { replace: true });
        }
      });
      return;
    }

    const fallback = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 3000);

    return () => {
      clearTimeout(fallback);
    };
  }, [completeOAuthLogin, navigate, tokenParam, user]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-gradient-to-br from-pink-400/30 to-blue-400/30 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/40 bg-white/95 p-10 text-center shadow-2xl backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/90"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          className="mx-auto mb-6 h-16 w-16 rounded-full border-4 border-blue-100/70 border-t-blue-600"
        />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Finishing up your sign-in</h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          We are securely exchanging credentials with Google. You will be redirected automatically once everything is confirmed.
        </p>
        <p className="mt-6 text-xs text-gray-400">
          If this page does not refresh, close the tab and return to the login screen.
        </p>
      </motion.div>
    </div>
  );
};

export default OAuthCallback;
