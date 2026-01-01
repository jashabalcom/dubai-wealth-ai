import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Target, 
  Clock, 
  DollarSign, 
  Users, 
  Linkedin,
  MessageSquare,
  UserPlus,
  Crown,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useAuth } from '@/hooks/useAuth';

const MemberProfilePage = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: member, isLoading, error } = useMemberProfile(memberId);

  const isOwnProfile = user?.id === memberId;
  const isElite = member?.membership_tier === 'elite';

  const getMembershipBadgeStyle = (tier: string | null) => {
    switch (tier) {
      case 'elite':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-0';
      case 'investor':
        return 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Member Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This profile doesn't exist or is no longer visible in the directory.
            </p>
            <Button onClick={() => navigate('/community/members')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/community/members')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Profile Header Card */}
          <Card className={`overflow-hidden ${isElite ? 'ring-2 ring-amber-500/50' : ''}`}>
            {/* Cover gradient */}
            <div className={`h-32 ${isElite 
              ? 'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20' 
              : 'bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20'
            }`} />
            
            <CardContent className="relative pt-0 pb-6">
              {/* Avatar - positioned to overlap cover */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
                <div className={`relative ${isElite ? 'p-1 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500' : ''}`}>
                  <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="text-3xl bg-muted">
                      {member.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {isElite && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full p-2 shadow-lg">
                      <Crown className="w-4 h-4 text-black" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left pb-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{member.full_name || 'Anonymous'}</h1>
                    <Badge className={getMembershipBadgeStyle(member.membership_tier)}>
                      {member.membership_tier === 'elite' && <Crown className="w-3 h-3 mr-1" />}
                      {member.membership_tier || 'Free'}
                    </Badge>
                    {member.is_demo_member && (
                      <Badge variant="outline" className="text-muted-foreground">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Demo
                      </Badge>
                    )}
                  </div>

                  {member.country && (
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{member.country}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button asChild>
                      <Link to="/profile">Edit Profile</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Bio Section */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  {member.bio ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">{member.bio}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No bio provided yet.</p>
                  )}

                  {member.looking_for && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Looking For
                        </h3>
                        <p className="text-muted-foreground">{member.looking_for}</p>
                      </div>
                    </>
                  )}

                  {member.linkedin_url ? (
                    <>
                      <Separator className="my-4" />
                      <Button variant="outline" size="sm" asChild>
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4 mr-2" />
                          View LinkedIn Profile
                        </a>
                      </Button>
                    </>
                  ) : !isOwnProfile && !member.is_demo_member && (
                    <>
                      <Separator className="my-4" />
                      <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        Connect to see LinkedIn profile
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Details Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Investment Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {member.investment_goal && (
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Goal</p>
                        <p className="text-sm text-muted-foreground">{member.investment_goal}</p>
                      </div>
                    </div>
                  )}

                  {member.budget_range ? (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Budget</p>
                        <p className="text-sm text-muted-foreground">{member.budget_range}</p>
                      </div>
                    </div>
                  ) : !isOwnProfile && !member.is_demo_member && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Budget</p>
                        <p className="text-xs text-muted-foreground italic">Connect to view</p>
                      </div>
                    </div>
                  )}

                  {member.timeline && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Timeline</p>
                        <p className="text-sm text-muted-foreground">{member.timeline}</p>
                      </div>
                    </div>
                  )}

                  {member.created_at && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(member.created_at), 'MMMM yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MemberProfilePage;
