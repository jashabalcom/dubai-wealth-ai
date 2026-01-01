import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar,
  RefreshCw,
  Eye,
  Check,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDigestAdmin } from '@/hooks/useDailyDigest';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

const SENTIMENT_CONFIG = {
  bullish: { label: 'Bullish', icon: TrendingUp, color: 'text-green-500 bg-green-500/10' },
  bearish: { label: 'Bearish', icon: TrendingDown, color: 'text-red-500 bg-red-500/10' },
  neutral: { label: 'Neutral', icon: Minus, color: 'text-blue-500 bg-blue-500/10' },
  mixed: { label: 'Mixed', icon: RefreshCw, color: 'text-amber-500 bg-amber-500/10' },
};

export default function AdminDigest() {
  const { toast } = useToast();
  const { digests, isLoading, refetch } = useDigestAdmin();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSummary, setEditingSummary] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState('');

  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-daily-digest');
      
      if (error) throw error;
      
      toast({
        title: 'Digest Generated',
        description: `Created digest for ${data.digestDate} with ${data.articlesIncluded} articles`,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (digestId: string) => {
    try {
      const { error } = await supabase
        .from('daily_market_digests')
        .update({ is_published: true })
        .eq('id', digestId);

      if (error) throw error;
      
      toast({ title: 'Digest Published' });
      refetch();
    } catch (error) {
      toast({
        title: 'Publish Failed',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSummary = async (digestId: string) => {
    try {
      const { error } = await supabase
        .from('daily_market_digests')
        .update({ executive_summary: summaryText })
        .eq('id', digestId);

      if (error) throw error;
      
      toast({ title: 'Summary Updated' });
      setEditingSummary(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Update Failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout title="Daily Digest Manager">
      <div className="space-y-6">
        {/* Actions Bar */}
        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleGenerateDigest} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate Today's Digest
              </Button>

              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {digests.length} digests available
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digests List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </Card>
          ) : digests.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No digests generated yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Generate Today's Digest" to create your first market briefing
              </p>
            </Card>
          ) : (
            digests.map((digest) => {
              const sentiment = digest.market_sentiment || 'neutral';
              const SentimentIcon = SENTIMENT_CONFIG[sentiment as keyof typeof SENTIMENT_CONFIG]?.icon || Minus;
              
              return (
                <motion.div
                  key={digest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="overflow-hidden hover:border-gold/30 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={digest.is_published ? 'default' : 'secondary'}>
                              {digest.is_published ? 'Published' : 'Draft'}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={SENTIMENT_CONFIG[sentiment as keyof typeof SENTIMENT_CONFIG]?.color}
                            >
                              <SentimentIcon className="h-3 w-3 mr-1" />
                              {SENTIMENT_CONFIG[sentiment as keyof typeof SENTIMENT_CONFIG]?.label}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">
                            {format(new Date(digest.digest_date), 'EEEE, MMMM d, yyyy')}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {!digest.is_published && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePublish(digest.id)}
                              className="text-green-500 hover:text-green-600"
                              variant="outline"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Publish
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  {format(new Date(digest.digest_date), 'MMMM d, yyyy')} Digest
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div>
                                  <h3 className="font-semibold text-lg text-foreground mb-2">
                                    {digest.headline}
                                  </h3>
                                  <p className="text-muted-foreground">
                                    {digest.executive_summary}
                                  </p>
                                </div>
                                
                                {digest.key_metrics && (
                                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                    {Object.entries(digest.key_metrics as Record<string, string>).map(([key, value]) => (
                                      <div key={key}>
                                        <p className="text-xs text-muted-foreground capitalize">
                                          {key.replace(/_/g, ' ')}
                                        </p>
                                        <p className="font-semibold">{value}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-foreground mb-2">{digest.headline}</h3>
                      
                      {editingSummary === digest.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={summaryText}
                            onChange={(e) => setSummaryText(e.target.value)}
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveSummary(digest.id)}>
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingSummary(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p 
                          className="text-sm text-muted-foreground line-clamp-3 cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => {
                            setEditingSummary(digest.id);
                            setSummaryText(digest.executive_summary);
                          }}
                        >
                          {digest.executive_summary}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span>
                          {digest.top_article_ids?.length || 0} articles included
                        </span>
                        <span>•</span>
                        <span>
                          Created {format(new Date(digest.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
