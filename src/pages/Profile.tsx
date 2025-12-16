import { useState, useRef } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import {
  User,
  Crown,
  Calendar,
  MapPin,
  Target,
  Clock,
  Camera,
  MessageSquare,
  Heart,
  FileText,
  Edit3,
  Check,
  X,
  Linkedin,
  Briefcase,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ConnectButton } from '@/components/community/ConnectButton';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { userId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const targetUserId = userId || user?.id;
  const {
    profile,
    posts,
    comments,
    profileLoading,
    postsLoading,
    commentsLoading,
    updateProfile,
    uploadAvatar,
    isOwnProfile,
  } = useProfile(targetUserId);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLookingFor, setEditLookingFor] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground">This user profile does not exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditName(profile.full_name || '');
    setEditCountry(profile.country || '');
    setEditBio((profile as any).bio || '');
    setEditLookingFor((profile as any).looking_for || '');
    setEditLinkedin((profile as any).linkedin_url || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateProfile.mutate({
      full_name: editName,
      country: editCountry,
      bio: editBio,
      looking_for: editLookingFor,
      linkedin_url: editLinkedin,
    } as any);
    setIsEditing(false);
  };

  const handleToggleDirectoryVisibility = () => {
    const currentValue = (profile as any).is_visible_in_directory ?? true;
    updateProfile.mutate({
      is_visible_in_directory: !currentValue,
    } as any);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file);
    }
  };

  const getMembershipBadgeColor = (tier: string) => {
    switch (tier) {
      case 'elite':
        return 'bg-gradient-to-r from-gold/20 to-gold/10 text-gold border-gold/30';
      case 'investor':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 relative">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 pt-24 md:pt-28 pb-8">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl shadow-black/5"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative group">
                <Avatar
                  className={cn(
                    'h-28 w-28 ring-4 ring-offset-4 ring-offset-card cursor-pointer transition-all',
                    profile.membership_tier === 'elite' ? 'ring-gold/50' : 'ring-border/50',
                    isOwnProfile && 'group-hover:ring-gold/70'
                  )}
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback
                    className={cn(
                      'text-2xl font-serif',
                      profile.membership_tier === 'elite' ? 'bg-gold/20 text-gold' : 'bg-muted'
                    )}
                  >
                    {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 p-2 bg-gold text-background rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {profile.membership_tier === 'elite' && (
                  <div className="absolute -top-2 -right-2 p-2 rounded-full bg-card border border-gold/30 shadow-lg shadow-gold/20">
                    <Crown className="h-4 w-4 text-gold" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Full name"
                          className="text-2xl font-serif h-auto py-1 px-2 bg-muted/30"
                        />
                        <Input
                          value={editCountry}
                          onChange={(e) => setEditCountry(e.target.value)}
                          placeholder="Country"
                          className="h-auto py-1 px-2 bg-muted/30"
                        />
                        <Input
                          value={editLinkedin}
                          onChange={(e) => setEditLinkedin(e.target.value)}
                          placeholder="LinkedIn URL (optional)"
                          className="h-auto py-1 px-2 bg-muted/30"
                        />
                        <Input
                          value={editLookingFor}
                          onChange={(e) => setEditLookingFor(e.target.value)}
                          placeholder="Looking for (e.g., Joint ventures, Networking)"
                          className="h-auto py-1 px-2 bg-muted/30"
                        />
                        <Textarea
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="Short bio about yourself..."
                          className="bg-muted/30 min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={updateProfile.isPending}
                            className="bg-gold hover:bg-gold/90 text-background"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-serif font-bold mb-1">
                          {profile.full_name || 'Anonymous User'}
                        </h1>
                        <p className="text-muted-foreground mb-3">{profile.email}</p>
                        
                        {/* Bio */}
                        {(profile as any).bio && (
                          <p className="text-sm text-muted-foreground mb-3 max-w-lg">
                            {(profile as any).bio}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className={cn('capitalize', getMembershipBadgeColor(profile.membership_tier))}
                          >
                            {profile.membership_tier === 'elite' && <Crown className="h-3 w-3 mr-1" />}
                            {profile.membership_tier} Member
                          </Badge>
                          {profile.country && (
                            <Badge variant="outline" className="text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {profile.country}
                            </Badge>
                          )}
                          {(profile as any).looking_for && (
                            <Badge variant="outline" className="bg-gold/10 text-gold border-gold/30">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {(profile as any).looking_for}
                            </Badge>
                          )}
                          {(profile as any).linkedin_url && (
                            <a
                              href={(profile as any).linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex"
                            >
                              <Badge variant="outline" className="hover:bg-muted/50 cursor-pointer">
                                <Linkedin className="h-3 w-3 mr-1" />
                                LinkedIn
                              </Badge>
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {isOwnProfile && !isEditing && (
                    <Button variant="outline" size="sm" onClick={handleStartEdit}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  {!isOwnProfile && targetUserId && (
                    <div className="flex items-center gap-2">
                      <ConnectButton 
                        userId={targetUserId} 
                        userName={profile.full_name || undefined}
                      />
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/messages/${targetUserId}`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-6 pt-6 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold">{posts.length}</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{comments.length}</p>
                    <p className="text-sm text-muted-foreground">Comments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {posts.reduce((sum, post) => sum + post.likes_count, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Likes Received</p>
                  </div>
                </div>
              </div>

              {/* Membership Details */}
              <div className="bg-muted/30 rounded-xl p-5 min-w-[220px]">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Membership Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Crown className="h-4 w-4 text-gold" />
                    <span className="capitalize">{profile.membership_tier} Tier</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {format(new Date(profile.created_at), 'MMM yyyy')}</span>
                  </div>
                  {profile.investment_goal && (
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.investment_goal}</span>
                    </div>
                  )}
                  {profile.timeline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.timeline}</span>
                    </div>
                  )}
                </div>
                
                {/* Directory Visibility Toggle */}
                {isOwnProfile && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(profile as any).is_visible_in_directory !== false ? (
                          <Eye className="h-4 w-4 text-gold" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Label htmlFor="directory-visibility" className="text-sm cursor-pointer">
                          Show in Directory
                        </Label>
                      </div>
                      <Switch
                        id="directory-visibility"
                        checked={(profile as any).is_visible_in_directory !== false}
                        onCheckedChange={handleToggleDirectoryVisibility}
                        disabled={updateProfile.isPending}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Let other members find and connect with you
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Activity Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="bg-card/80 border border-border/50 p-1 mb-6">
                <TabsTrigger value="posts" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <FileText className="h-4 w-4 mr-2" />
                  Posts ({posts.length})
                </TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments ({comments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts">
                {postsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border/50 rounded-xl p-5 animate-pulse">
                        <div className="h-5 bg-muted/50 rounded w-2/3 mb-3" />
                        <div className="h-4 bg-muted/50 rounded w-full mb-2" />
                        <div className="h-4 bg-muted/50 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "You haven't posted anything yet. Share your thoughts with the community!"
                        : "This user hasn't posted anything yet."}
                    </p>
                    {isOwnProfile && (
                      <Link to="/community">
                        <Button className="mt-4 bg-gold hover:bg-gold/90 text-background">
                          Go to Community
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card/80 border border-border/50 rounded-xl p-5 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-serif font-semibold text-lg">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              in #{post.channel?.name} •{' '}
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 mb-4">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {post.comments_count}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments">
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-card border border-border/50 rounded-xl p-5 animate-pulse">
                        <div className="h-4 bg-muted/50 rounded w-1/3 mb-3" />
                        <div className="h-4 bg-muted/50 rounded w-full" />
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-12 bg-card/50 rounded-xl border border-border/50">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "You haven't commented on any posts yet."
                        : "This user hasn't commented on any posts yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card/80 border border-border/50 rounded-xl p-5 hover:shadow-lg transition-shadow"
                      >
                        <p className="text-sm text-muted-foreground mb-2">
                          On "{comment.post?.title}" •{' '}
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                        <p>{comment.content}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}