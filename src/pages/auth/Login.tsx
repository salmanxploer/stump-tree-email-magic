import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Sparkles, Timer, Users } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, supportsOAuth, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const storedEmail = useMemo(() => {
    if (typeof window === 'undefined') return '';
    try {
      return window.localStorage.getItem('cafeteria_remember_email') ?? '';
    } catch (_error) {
      return '';
    }
  }, []);
  const [rememberMe, setRememberMe] = useState<boolean>(() => Boolean(storedEmail));
  const [showPassword, setShowPassword] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: storedEmail,
      password: '',
    },
  });

  const highlights = [
    {
      icon: Sparkles,
      title: 'Smart dashboards',
      description: 'Get role-based insights on orders, revenue, and stock in real time.',
    },
    {
      icon: Users,
      title: 'Team friendly',
      description: 'Admins, staff, and students collaborate effortlessly in one place.',
    },
    {
      icon: Timer,
      title: 'Faster service',
      description: 'Streamlined queue management keeps campus meals moving quickly.',
    },
  ] as const;

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    const result = await login(data.email, data.password);
    
    if (result.success) {
      toast.success(result.message || 'Login successful!');
      
      if (rememberMe) {
        localStorage.setItem('cafeteria_remember_email', data.email);
      } else {
        localStorage.removeItem('cafeteria_remember_email');
      }
      
      reset({ email: data.email, password: '' });
      
      const roleToUse = result.user?.role ?? result.role;
      setTimeout(() => {
        if (roleToUse === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (roleToUse === 'staff') {
          navigate('/staff/dashboard', { replace: true });
        } else {
          navigate('/customer/menu', { replace: true });
        }
      }, 100);
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supportsOAuth) {
      toast.error('Google sign-in is unavailable. Please use email and password.');
      return;
    }
    
    setIsGoogleLoading(true);
    
    const result = await loginWithGoogle();
    
    if (result.success) {
      toast.success(result.message);
      navigate('/customer/menu');
    } else {
      toast.error(result.message);
    }
    
    setIsGoogleLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-pink-400/20 to-blue-400/20 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row">
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative hidden overflow-hidden rounded-3xl border border-blue-100/60 bg-white/70 p-10 shadow-xl backdrop-blur-md dark:border-gray-800/60 dark:bg-gray-900/70 lg:block lg:flex-1"
          >
            <div className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-br from-pink-500/20 to-blue-500/20 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-4 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-100">
                  <Sparkles className="h-4 w-4" />
                  Welcome back to BUBT Cafeteria
                </span>
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Fuel your campus day with smarter dining experiences.
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  Manage personalized menus, monitor order progress, and keep every hungry student happy from a single dashboard.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {highlights.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                        className="flex flex-col gap-2 rounded-2xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/70"
                      >
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300">
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-semibold uppercase">{item.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {item.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="mt-10 rounded-2xl border border-white/50 bg-gradient-to-r from-blue-600/90 to-purple-600/90 p-6 shadow-lg backdrop-blur-sm text-white"
              >
                <p className="text-sm uppercase tracking-widest text-white/70">Campus highlights</p>
                <div className="mt-3 flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-3xl font-bold">1.2k+</p>
                    <p className="text-sm text-white/80">Daily orders served</p>
                  </div>
                  <div className="h-12 w-px bg-white/30" />
                  <div>
                    <p className="text-3xl font-bold">98%</p>
                    <p className="text-sm text-white/80">User satisfaction rate</p>
                  </div>
                  <div className="h-12 w-px bg-white/30" />
                  <div>
                    <p className="text-3xl font-bold">24/7</p>
                    <p className="text-sm text-white/80">Order tracking access</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          <Card className="w-full max-w-lg border border-white/40 bg-white/95 shadow-2xl backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/90 lg:w-auto">
            <CardHeader className="space-y-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-2xl font-bold text-white shadow-lg"
              >
                BC
              </motion.div>
              <CardTitle className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BUBT Cafeteria
                </span>
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                Welcome back! Sign in to manage your cafeteria experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                type="button"
                variant="outline"
                className="w-full border border-gray-200 bg-white/70 hover:bg-white/90 dark:border-gray-800 dark:bg-gray-900/80"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading || !supportsOAuth}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-5 w-5"
                >
                  <path
                    fill="#fbc02d"
                    d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
                  />
                  <path
                    fill="#e53935"
                    d="M6.3 14.7l6.6 4.8C14.4 16.1 18.8 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.2 6.1 29.4 4 24 4c-7.8 0-14.5 4.4-17.7 10.7z"
                  />
                  <path
                    fill="#4caf50"
                    d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.4 35.9 26.9 37 24 37c-5.2 0-9.6-3.1-11.6-7.5l-6.6 5.1C9 39.6 15 44 24 44z"
                  />
                  <path
                    fill="#1565c0"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.8 4-6.1 7-11.3 7-5.2 0-9.6-3.1-11.6-7.5l-6.6 5.1C9 39.6 15 44 24 44c11 0 20-8.9 20-20 0-1.2-.1-2.3-.4-3.5z"
                  />
                </svg>
                {supportsOAuth ? (isGoogleLoading ? 'Redirecting to Google...' : 'Sign in with Google') : 'Google sign-in unavailable'}
              </Button>

              <div className="relative text-center text-sm text-gray-500 dark:text-gray-400">
                <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-gray-200 dark:border-gray-800" />
                <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-900">
                  Or continue with email
                </span>
              </div>

              

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      {...register('email')}
                      className={`pl-11 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...register('password')}
                      className={`pl-11 pr-11 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
                      const result = await resetPassword(email);
                      if (result.success) {
                        toast.success(result.message);
                      } else {
                        toast.error(result.message);
                      }
                    }}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? 'Signing you in...' : 'Sign in'}
                </Button>
              </form>

              <div className="space-y-4 text-sm">
                <div className="rounded-xl bg-blue-50/80 p-4 text-left text-gray-700 shadow-sm dark:bg-blue-950/40 dark:text-gray-200">
                  <p className="mb-2 font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Demo access
                  </p>
                  <ul className="space-y-1 text-sm">
                    {/* <li>Admin: admin@bubt.edu</li>
                    <li>Staff: staff@bubt.edu</li> */}
                    <li>Student: 20235203026@cse.bubt.edu.bd</li>
                  </ul>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Password: 20235203026</p>
                </div>
                <p className="text-center text-gray-600 dark:text-gray-300">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Create one now
                  </Link>
                </p>
              </div>

              
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
