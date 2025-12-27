import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CreditCard, Trash2, User, Shield, ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CookiePreferencesManager } from '@/components/CookiePreferences';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const { openCustomerPortal, loading: portalLoading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  const validatePasswordForm = () => {
    const newErrors: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword) {
      newErrors.current = 'Current password is required';
    }

    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      newErrors.new = passwordResult.error.errors[0].message;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);

    try {
      // First verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setErrors({ current: 'Current password is incorrect' });
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast({
          title: 'Error updating password',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password updated',
          description: 'Your password has been successfully changed.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;

    setIsDeletingAccount(true);

    try {
      // Note: Full account deletion requires admin privileges
      // For now, we'll sign out and show a message about contacting support
      await signOut();
      toast({
        title: 'Account deletion requested',
        description: 'Please contact support@dubaiwealthhub.com to complete your account deletion.',
      });
      navigate('/');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const getTierBadge = () => {
    const tier = profile?.membership_tier || 'free';
    const colors = {
      free: 'bg-muted text-muted-foreground',
      investor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      elite: 'bg-gold/10 text-gold border-gold/20',
    };
    return (
      <Badge variant="outline" className={colors[tier]}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="font-heading text-3xl text-foreground">Account Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account security and billing preferences
              </p>
            </div>

            <div className="space-y-6">
              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>Your account details and membership status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Membership</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getTierBadge()}
                        {profile?.membership_status === 'active' && (
                          <span className="text-sm text-green-500">Active</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing & Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Subscription Management</p>
                      <p className="text-sm text-muted-foreground">
                        View invoices, update payment method, or change your plan
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => openCustomerPortal()}
                      disabled={portalLoading || profile?.membership_tier === 'free'}
                    >
                      {portalLoading ? (
                        <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          Manage Billing
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                  {profile?.membership_tier === 'free' && (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground">
                        You're currently on the Free plan.{' '}
                        <a href="/pricing" className="text-gold hover:underline">
                          Upgrade to unlock premium features
                        </a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <NotificationPreferences />

              {/* Cookie Preferences */}
              <CookiePreferencesManager />

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="current"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.current && (
                        <p className="text-sm text-destructive">{errors.current}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="new"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.new && (
                        <p className="text-sm text-destructive">{errors.new}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirm"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.confirm && (
                        <p className="text-sm text-destructive">{errors.confirm}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Updating...
                        </span>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Delete Account */}
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 mb-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive mb-1">This action cannot be undone</p>
                        <p className="text-muted-foreground">
                          Once you delete your account, all your data including saved properties, portfolio, 
                          course progress, and community posts will be permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="delete-confirm">
                          Type <span className="font-mono font-bold">DELETE</span> to confirm
                        </Label>
                        <Input
                          id="delete-confirm"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder="DELETE"
                          className="mt-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== 'DELETE' || isDeletingAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
