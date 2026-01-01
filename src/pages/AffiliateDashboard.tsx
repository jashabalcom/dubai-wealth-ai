import { useState } from 'react';
import { useAffiliate } from '@/hooks/useAffiliate';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Copy, 
  DollarSign, 
  Users, 
  MousePointer, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Link2,
  CreditCard,
  Bell,
  Settings,
  QrCode
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Navigate } from 'react-router-dom';

const AffiliateDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    affiliate, 
    referrals, 
    commissions, 
    payouts, 
    notifications,
    stats,
    loading,
    isAffiliate,
    applyAsAffiliate,
    connectStripeAccount,
    copyReferralLink,
    markNotificationRead
  } = useAffiliate();

  const [applicationNotes, setApplicationNotes] = useState('');
  const [applying, setApplying] = useState(false);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleApply = async () => {
    setApplying(true);
    await applyAsAffiliate(applicationNotes);
    setApplying(false);
  };

  // Not an affiliate yet - show application form
  if (!isAffiliate) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Join Our Partner Program</CardTitle>
              <CardDescription>
                Earn 50% commission on every subscription you refer. Get paid monthly via Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">50%</div>
                  <div className="text-sm text-muted-foreground">Commission</div>
                </div>
                <div className="p-4 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">90 Days</div>
                  <div className="text-sm text-muted-foreground">Cookie Duration</div>
                </div>
                <div className="p-4 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">Monthly</div>
                  <div className="text-sm text-muted-foreground">Payouts</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tell us about yourself (optional)</label>
                  <Textarea
                    placeholder="How do you plan to promote Dubai REI Community?"
                    value={applicationNotes}
                    onChange={(e) => setApplicationNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button 
                  onClick={handleApply} 
                  disabled={applying}
                  className="w-full"
                  size="lg"
                >
                  {applying ? 'Submitting...' : 'Apply to Partner Program'}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                Applications are typically reviewed within 24-48 hours.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pending approval
  if (affiliate?.status === 'pending') {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle>Application Under Review</CardTitle>
              <CardDescription>
                Your partner application is being reviewed by our team.
                We'll notify you once it's approved.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Applied on {format(new Date(affiliate.created_at), 'PPP')}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Rejected
  if (affiliate?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Application Not Approved</CardTitle>
              <CardDescription>
                Unfortunately, your application wasn't approved at this time.
                Contact support for more information.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Approved - Full dashboard
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Partner Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your referral performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={affiliate?.stripe_connect_status === 'active' ? 'default' : 'secondary'}>
              {affiliate?.affiliate_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Button onClick={copyReferralLink} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Clicks</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.totalClicks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Signups</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.totalSignups}</div>
              <div className="text-xs text-muted-foreground">{stats.conversionRate}% conversion</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <div className="text-2xl font-bold mt-2">${stats.pendingEarnings.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">{stats.pendingCommissions} commissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Earned</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-primary">${stats.totalEarnings.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Stripe Connect Banner */}
        {affiliate?.stripe_connect_status !== 'active' && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-amber-600" />
                <div>
                  <div className="font-medium">Connect your Stripe account</div>
                  <div className="text-sm text-muted-foreground">
                    Complete Stripe onboarding to receive your payouts
                  </div>
                </div>
              </div>
              <Button onClick={connectStripeAccount}>
                Connect Stripe
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {stats.unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                  {stats.unreadNotifications}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Referral Link Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Your Referral Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    {window.location.origin}?ref={affiliate?.referral_code}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={copyReferralLink} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="outline" size="icon">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Your code: <code className="bg-muted px-2 py-0.5 rounded">{affiliate?.referral_code}</code>
                  </div>
                </CardContent>
              </Card>

              {/* Commission Rates Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Commission Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Dubai Investor (Monthly)</span>
                      <span className="font-medium">$49.50</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dubai Investor (Annual)</span>
                      <span className="font-medium">$534.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dubai Elite (Monthly)</span>
                      <span className="font-medium">$199.50</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dubai Elite (Annual)</span>
                      <span className="font-medium">$2,154.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dubai Private</span>
                      <span className="font-medium">$12,500.00</span>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    50% commission on all subscriptions • 60-day qualification period
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>
                  Users who signed up using your referral link
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No referrals yet. Share your link to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((referral) => {
                      const daysUntilQualified = differenceInDays(
                        new Date(referral.qualification_date),
                        new Date()
                      );
                      const qualificationProgress = Math.min(
                        100,
                        ((60 - Math.max(0, daysUntilQualified)) / 60) * 100
                      );

                      return (
                        <div key={referral.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                referral.status === 'qualified' ? 'default' :
                                referral.status === 'pending' ? 'secondary' :
                                'destructive'
                              }>
                                {referral.status}
                              </Badge>
                              {referral.first_subscription_product && (
                                <span className="text-sm text-muted-foreground">
                                  {referral.first_subscription_product}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(referral.referred_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {referral.status === 'pending' && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Qualification progress</span>
                                <span>{daysUntilQualified > 0 ? `${daysUntilQualified} days left` : 'Processing...'}</span>
                              </div>
                              <Progress value={qualificationProgress} className="h-2" />
                            </div>
                          )}
                          {referral.first_subscription_amount && (
                            <div className="text-sm mt-2">
                              Commission: <span className="font-medium">${(referral.first_subscription_amount * 0.5).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Commission History</CardTitle>
                <CardDescription>
                  Track your earnings from referrals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No commissions yet. They'll appear here once referrals qualify.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {commissions.map((commission) => (
                      <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{commission.product_type.replace(/_/g, ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            {commission.billing_period} • {format(new Date(commission.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${commission.commission_amount.toFixed(2)}</div>
                          <Badge variant={
                            commission.status === 'paid' ? 'default' :
                            commission.status === 'approved' ? 'secondary' :
                            commission.status === 'voided' ? 'destructive' :
                            'outline'
                          }>
                            {commission.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  Payouts are processed on the 1st of each month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No payouts yet. Minimum payout is $50.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">${payout.amount.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {payout.commission_count} commissions • {format(new Date(payout.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                        <Badge variant={
                          payout.status === 'completed' ? 'default' :
                          payout.status === 'processing' ? 'secondary' :
                          payout.status === 'failed' ? 'destructive' :
                          'outline'
                        }>
                          {payout.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          !notification.is_read ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                        onClick={() => !notification.is_read && markNotificationRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {!notification.is_read && (
                                <span className="h-2 w-2 rounded-full bg-primary" />
                              )}
                              {notification.title}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notification.created_at), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
