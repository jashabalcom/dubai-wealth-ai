import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import heroImage from '@/assets/hero-dubai-skyline.jpg';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in - check for pending checkout intent
  useEffect(() => {
    if (user) {
      const pendingTier = localStorage.getItem('pending_checkout_tier');
      const pendingUpgrade = localStorage.getItem('pending_checkout_upgrade');
      
      if (pendingTier && (pendingTier === 'investor' || pendingTier === 'elite')) {
        localStorage.removeItem('pending_checkout_tier');
        localStorage.removeItem('pending_checkout_upgrade');
        navigate(`/checkout/${pendingTier}${pendingUpgrade === 'true' ? '?upgrade=true' : ''}`);
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.name = nameResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setResetEmailSent(true);
        toast({
          title: 'Check your email',
          description: 'We sent you a password reset link.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Invalid credentials',
              description: 'Please check your email and password and try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error signing in',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          const pendingTier = localStorage.getItem('pending_checkout_tier');
          const pendingUpgrade = localStorage.getItem('pending_checkout_upgrade');
          
          if (pendingTier && (pendingTier === 'investor' || pendingTier === 'elite')) {
            localStorage.removeItem('pending_checkout_tier');
            localStorage.removeItem('pending_checkout_upgrade');
            toast({
              title: 'Welcome back!',
              description: 'Continuing to checkout...',
            });
            navigate(`/checkout/${pendingTier}${pendingUpgrade === 'true' ? '?upgrade=true' : ''}`);
          } else {
            toast({
              title: 'Welcome back!',
              description: 'You have successfully signed in.',
            });
            navigate('/dashboard');
          }
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error signing up',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          const pendingTier = localStorage.getItem('pending_checkout_tier');
          const pendingUpgrade = localStorage.getItem('pending_checkout_upgrade');
          
          if (pendingTier && (pendingTier === 'investor' || pendingTier === 'elite')) {
            localStorage.removeItem('pending_checkout_tier');
            localStorage.removeItem('pending_checkout_upgrade');
            toast({
              title: 'Welcome to Dubai Wealth Hub!',
              description: 'Continuing to checkout...',
            });
            navigate(`/checkout/${pendingTier}${pendingUpgrade === 'true' ? '?upgrade=true' : ''}`);
          } else {
            toast({
              title: 'Welcome to Dubai Wealth Hub!',
              description: 'Your account has been created successfully.',
            });
            navigate('/dashboard');
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const pendingTier = localStorage.getItem('pending_checkout_tier');
      let redirectUrl = `${window.location.origin}/dashboard`;
      
      if (pendingTier) {
        localStorage.setItem('pending_oauth_checkout', 'true');
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Left side - Form Panel with Dark Luxury Theme */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-gold/5" />
        
        {/* Decorative blur orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-gold/3 rounded-full blur-2xl" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-10">
            <a href="/" className="inline-flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold/80 flex items-center justify-center shadow-lg shadow-gold/20"
              >
                <span className="text-secondary font-heading font-bold text-xl">DW</span>
              </motion.div>
              <span className="font-heading text-2xl text-pearl">Dubai Wealth Hub</span>
            </a>
          </motion.div>

          {showForgotPassword ? (
            // Forgot Password View
            <>
              <motion.button
                variants={itemVariants}
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmailSent(false);
                  setErrors({});
                }}
                className="flex items-center gap-2 text-pearl/60 hover:text-gold mb-8 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to sign in
              </motion.button>
              
              <motion.h1 variants={itemVariants} className="font-heading text-3xl md:text-4xl text-pearl mb-3">
                Reset Your Password
              </motion.h1>
              <motion.p variants={itemVariants} className="text-pearl/60 mb-10 text-lg">
                {resetEmailSent 
                  ? 'Check your email for a password reset link.'
                  : "Enter your email and we'll send you a reset link."}
              </motion.p>

              {!resetEmailSent ? (
                <motion.form variants={itemVariants} onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-pearl/80 font-medium">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/60 group-focus-within:text-gold transition-colors" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 bg-secondary/50 border-pearl/10 text-pearl placeholder:text-pearl/30 focus:border-gold/50 focus:ring-gold/20 rounded-xl transition-all"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full h-14 text-base font-semibold rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Reset Link
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.div 
                  variants={itemVariants}
                  className="text-center p-8 rounded-2xl bg-gold/10 border border-gold/20 backdrop-blur-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5">
                    <Mail className="w-8 h-8 text-gold" />
                  </div>
                  <p className="text-pearl font-heading text-xl mb-2">Email Sent!</p>
                  <p className="text-pearl/60">
                    Check your inbox for the reset link. If you don't see it, check your spam folder.
                  </p>
                </motion.div>
              )}
            </>
          ) : (
            // Login/Signup View
            <>
              <motion.h1 variants={itemVariants} className="font-heading text-3xl md:text-4xl text-pearl mb-3">
                {isLogin ? (
                  <>Welcome Back, <span className="text-gradient-gold">Investor</span></>
                ) : (
                  <>Begin Your <span className="text-gradient-gold">Investment Journey</span></>
                )}
              </motion.h1>
              <motion.p variants={itemVariants} className="text-pearl/60 mb-10 text-lg">
                {isLogin
                  ? 'Sign in to access your investment dashboard and portfolio.'
                  : 'Join thousands of global investors building wealth in Dubai.'}
              </motion.p>

              {/* Google OAuth Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full h-14 flex items-center justify-center gap-3 bg-pearl/5 border-pearl/10 text-pearl hover:bg-pearl/10 hover:border-gold/30 rounded-xl transition-all backdrop-blur-sm"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-pearl/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-secondary px-4 text-pearl/40 tracking-wider">
                    Or continue with email
                  </span>
                </div>
              </motion.div>

              <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-pearl/80 font-medium">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/60 group-focus-within:text-gold transition-colors" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-12 h-14 bg-secondary/50 border-pearl/10 text-pearl placeholder:text-pearl/30 focus:border-gold/50 focus:ring-gold/20 rounded-xl transition-all"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-pearl/80 font-medium">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/60 group-focus-within:text-gold transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-secondary/50 border-pearl/10 text-pearl placeholder:text-pearl/30 focus:border-gold/50 focus:ring-gold/20 rounded-xl transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-pearl/80 font-medium">Password</Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-gold hover:text-gold/80 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/60 group-focus-within:text-gold transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 bg-secondary/50 border-pearl/10 text-pearl placeholder:text-pearl/30 focus:border-gold/50 focus:ring-gold/20 rounded-xl transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-pearl/40 hover:text-gold transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-14 text-base font-semibold rounded-xl mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </motion.form>

              <motion.div variants={itemVariants} className="mt-8 text-center">
                <p className="text-pearl/60">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                    }}
                    className="ml-2 text-gold hover:text-gold/80 font-semibold transition-colors"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* Right side - Immersive Branding Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        {/* Gradient Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/70 to-secondary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-lg"
          >
            {/* Gold accent line */}
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold/50 rounded-full mb-8" />
            
            <h2 className="font-heading text-4xl xl:text-5xl text-pearl leading-tight mb-6">
              Your Gateway to{' '}
              <span className="text-gradient-gold">Dubai Real Estate</span>{' '}
              Excellence
            </h2>
            
            <p className="text-pearl/70 text-lg leading-relaxed mb-10">
              Access exclusive off-plan deals, AI-powered investment analysis, and join a community of sophisticated investors building generational wealth in the UAE.
            </p>

            {/* Trust indicators */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-pearl font-medium">$2.5B+ Investment Volume</p>
                  <p className="text-pearl/50 text-sm">Managed by our investor community</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-pearl font-medium">RERA Verified Properties</p>
                  <p className="text-pearl/50 text-sm">Only licensed, legitimate listings</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="text-pearl font-medium">AI-Powered Insights</p>
                  <p className="text-pearl/50 text-sm">Data-driven investment decisions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-2xl translate-y-1/2" />
      </div>
    </div>
  );
}
