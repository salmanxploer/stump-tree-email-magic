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
import { CalendarClock, Eye, EyeOff, HeartHandshake, Lock, Mail, Phone, Sparkles, UserRound } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['student','staff']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch('password', '');

  const highlights = [
    {
      icon: Sparkles,
      title: 'Tailored meals',
      description: 'Set your taste profile and get recommendations that match your routine.',
    },
    {
      icon: HeartHandshake,
      title: 'Earn rewards',
      description: 'Unlock loyalty perks with every pre-order and referral.',
    },
    {
      icon: CalendarClock,
      title: 'Skip the line',
      description: 'Reserve collection slots to avoid the campus rush hour.',
    },
  ] as const;

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    const result = await registerUser(data.name, data.email, data.password, data.role, data.phone);
    
    if (result.success) {
      toast.success(result.message || '🎉 Account created successfully! Welcome aboard!', {
        duration: 4000,
      });
      
      setTimeout(() => {
        if (data.role === 'staff') {
          navigate('/staff/dashboard', { replace: true });
        } else {
          navigate('/customer/menu', { replace: true });
        }
      }, 500);
    } else {
      toast.error(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
                  Join the BUBT Cafeteria family
                </span>
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Personalize your meals, earn rewards, and breeze through busy breaks.
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  Create an account to unlock pre-ordering, loyalty perks, curated menus, and live order tracking designed for busy students and teams.
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
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
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
                <p className="text-sm uppercase tracking-widest text-white/70">Why members love it</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-3xl font-bold">3k+</p>
                    <p className="text-sm text-white/80">Active campus foodies</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">15%</p>
                    <p className="text-sm text-white/80">Average wait time saved</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">50+</p>
                    <p className="text-sm text-white/80">Seasonal menu drops</p>
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
                  Create your account
                </span>
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-300">
                Tell us a little about yourself to personalize your cafeteria journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      {...register('name')}
                      className={`pl-11 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

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
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      {...register('phone')}
                      className="pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account type</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" value="student" {...register('role')} defaultChecked />
                      <span>Customer</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" value="staff" {...register('role')} />
                      <span>Staff</span>
                    </label>
                  </div>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      autoComplete="new-password"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                      className={`pl-11 pr-11 ${errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating your account...' : 'Create account'}
                </Button>
              </form>

              <div className="space-y-4 text-sm">
                <div className="rounded-xl bg-blue-50/80 p-4 text-left text-gray-700 shadow-sm dark:bg-blue-950/40 dark:text-gray-200">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Tip for teams
                  </p>
                  <p className="text-sm">
                    Invite your classmates or colleagues after creating your profile to share lunch budgets, split orders, and sync delivery windows.
                  </p>
                </div>
                <p className="text-center text-gray-600 dark:text-gray-300">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Sign in here
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

export default Register;
