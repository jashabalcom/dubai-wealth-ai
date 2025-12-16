import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  RefreshCw, 
  Sparkles, 
  Check, 
  X, 
  Trash2, 
  ExternalLink,
  Clock,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNewsAdmin } from '@/hooks/useNews';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

const CATEGORY_LABELS: Record<string, string> = {
  market_trends: 'Market Trends',
  developer_news: 'Developer News',
  golden_visa: 'Golden Visa',
  off_plan: 'Off-Plan',
  regulations: 'Regulations',
  lifestyle: 'Lifestyle',
};

export default function AdminNews() {
  const { toast } = useToast();
  const { 
    articles, 
    drafts, 
    isLoading, 
    isSyncing, 
    isGenerating,
    syncRSS,
    generateFeatured,
    publishArticle,
    archiveArticle,
    deleteArticle,
  } = useNewsAdmin();

  const [generateUrl, setGenerateUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSync = async () => {
    try {
      const result = await syncRSS();
      toast({
        title: 'RSS Sync Complete',
        description: `Synced ${result?.synced || 0} new articles, ${result?.skipped || 0} skipped`,
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleGenerate = async () => {
    if (!generateUrl.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a valid article URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await generateFeatured(generateUrl);
      toast({
        title: 'Article Generated',
        description: `"${result?.title}" created as draft`,
      });
      setGenerateUrl('');
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishArticle(id);
      toast({ title: 'Article Published' });
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveArticle(id);
      toast({ title: 'Article Archived' });
    } catch (error) {
      toast({
        title: 'Archive Failed',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteArticle(id);
      toast({ title: 'Article Deleted' });
    } catch (error) {
      toast({
        title: 'Delete Failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout title="News Manager">
      <div className="space-y-6">
        {/* Actions Bar */}
        <Card className="bg-card/80">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync RSS Feeds
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Featured Article
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate AI Featured Article</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      Enter the URL of a news article to generate an AI-rewritten investment analysis.
                      Uses Firecrawl to scrape and Lovable AI to rewrite.
                    </p>
                    <Input
                      placeholder="https://www.thenationalnews.com/..."
                      value={generateUrl}
                      onChange={(e) => setGenerateUrl(e.target.value)}
                    />
                    <Button 
                      onClick={handleGenerate} 
                      disabled={isGenerating || !generateUrl.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Article
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {drafts.length} drafts pending review
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="drafts">
          <TabsList>
            <TabsTrigger value="drafts" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Drafts ({drafts.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2">
              <Check className="h-4 w-4" />
              Published ({articles.length})
            </TabsTrigger>
          </TabsList>

          {/* Drafts Tab */}
          <TabsContent value="drafts" className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </Card>
            ) : drafts.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No drafts pending review</p>
              </Card>
            ) : (
              drafts.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="overflow-hidden hover:border-gold/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {article.image_url && (
                          <img 
                            src={article.image_url} 
                            alt="" 
                            className="w-24 h-16 object-cover rounded-lg shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">
                              {article.article_type === 'featured' ? 'Featured' : 'Headline'}
                            </Badge>
                            <Badge variant="outline">
                              {CATEGORY_LABELS[article.category] || article.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-foreground truncate">{article.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{article.source_name}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
                            {article.reading_time_minutes && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {article.reading_time_minutes} min
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={article.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-500 hover:text-green-600 hover:border-green-500"
                            onClick={() => handlePublish(article.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(article.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Published Tab */}
          <TabsContent value="published" className="space-y-4">
            {isLoading ? (
              <Card className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </Card>
            ) : articles.length === 0 ? (
              <Card className="p-8 text-center">
                <Newspaper className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No published articles yet</p>
              </Card>
            ) : (
              articles.map((article) => (
                <Card key={article.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {article.image_url && (
                        <img 
                          src={article.image_url} 
                          alt="" 
                          className="w-24 h-16 object-cover rounded-lg shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-green-500/20 text-green-500">Published</Badge>
                          <Badge variant="outline">
                            {CATEGORY_LABELS[article.category] || article.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground truncate">{article.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{article.source_name}</span>
                          <span>•</span>
                          <span>
                            {article.published_at && format(new Date(article.published_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleArchive(article.id)}
                        >
                          Archive
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}