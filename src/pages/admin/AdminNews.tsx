import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, 
  RefreshCw, 
  Sparkles, 
  Check, 
  Trash2, 
  ExternalLink,
  Clock,
  FileText,
  AlertCircle,
  Loader2,
  Eye,
  Pencil,
  Image as ImageIcon
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNewsAdmin, NewsArticle } from '@/hooks/useNews';
import { formatDistanceToNow, format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const CATEGORY_LABELS: Record<string, string> = {
  market_trends: 'Market Trends',
  developer_news: 'Developer News',
  golden_visa: 'Golden Visa',
  off_plan: 'Off-Plan',
  regulations: 'Regulations',
  lifestyle: 'Lifestyle',
};

// Preview Modal Component
function ArticlePreviewModal({ article, onPublish }: { article: NewsArticle; onPublish: () => void }) {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview Article
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 pt-4">
        {article.image_url && (
          <div className="aspect-[21/9] rounded-lg overflow-hidden bg-muted">
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {article.article_type === 'featured' ? 'Featured' : 'Headline'}
          </Badge>
          <Badge variant="outline">
            {CATEGORY_LABELS[article.category] || article.category}
          </Badge>
        </div>

        <h2 className="font-serif text-2xl font-bold text-foreground">
          {article.title}
        </h2>

        <div className="flex items-center gap-4 text-sm text-muted-foreground pb-4 border-b border-border">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.reading_time_minutes || 5} min read
          </span>
          <span>{article.source_name}</span>
        </div>

        <article className="prose-luxury">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content || article.excerpt || ''}
          </ReactMarkdown>
        </article>
      </div>

      <DialogFooter>
        <Button variant="outline" className="text-green-500 hover:text-green-600" onClick={onPublish}>
          <Check className="h-4 w-4 mr-2" />
          Publish Article
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Edit Modal Component with full editing capabilities
function ArticleEditModal({ 
  article, 
  onSave, 
  isSaving 
}: { 
  article: NewsArticle; 
  onSave: (updates: Partial<NewsArticle>) => Promise<void>;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(article.title);
  const [excerpt, setExcerpt] = useState(article.excerpt || '');
  const [content, setContent] = useState(article.content || '');
  const [imageUrl, setImageUrl] = useState(article.image_url || '');
  const [category, setCategory] = useState(article.category);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    await onSave({ 
      title, 
      excerpt, 
      content, 
      image_url: imageUrl || null,
      category 
    });
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5" />
          Edit Article
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 pt-4">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Excerpt</label>
          <Textarea 
            value={excerpt} 
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief description shown in article cards"
            rows={2}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={(val) => setCategory(val as typeof category)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Image */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Article Image
          </label>
          
          {/* Current image preview */}
          {imageUrl && (
            <div className="rounded-lg overflow-hidden bg-muted aspect-[21/9] max-w-md">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Upload option */}
          <ImageUploader
            currentImageUrl={imageUrl || null}
            onUpload={(url) => setImageUrl(url)}
            bucket="post-images"
            folder="news"
            aspectRatio={21/9}
            label="Upload Replacement Image"
            previewClassName="hidden"
          />

          {/* URL input fallback */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Or paste image URL:</span>
            <Input 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Content with Preview Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Content (Markdown)</label>
            <div className="flex gap-1">
              <Button 
                type="button" 
                size="sm" 
                variant={!showPreview ? "default" : "outline"}
                onClick={() => setShowPreview(false)}
              >
                Edit
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant={showPreview ? "default" : "outline"}
                onClick={() => setShowPreview(true)}
              >
                Preview
              </Button>
            </div>
          </div>
          
          {showPreview ? (
            <div className="border border-border rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto bg-background">
              <article className="prose-luxury prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || '*No content yet*'}
                </ReactMarkdown>
              </article>
            </div>
          ) : (
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              placeholder="## Key Takeaways&#10;&#10;- Point one&#10;- Point two&#10;&#10;## Analysis&#10;&#10;Full article content in markdown..."
              rows={15}
              className="font-mono text-sm"
            />
          )}
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

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
    refetch,
  } = useNewsAdmin();

  const [generateUrl, setGenerateUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);

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

  const handleBackfill = async () => {
    setIsBackfilling(true);
    try {
      const { data, error } = await supabase.functions.invoke('backfill-news-content');
      
      if (error) throw error;
      
      toast({
        title: 'Backfill Complete',
        description: `Processed ${data.processed} articles, ${data.failed} failed`,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Backfill Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsBackfilling(false);
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

  const handleSaveEdit = async (id: string, updates: Partial<NewsArticle>) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('news_articles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Article Updated' });
      refetch();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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

              <Button 
                onClick={handleBackfill} 
                disabled={isBackfilling}
                variant="outline"
                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                {isBackfilling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Regenerate All Headlines
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
                          {/* Preview Button */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <ArticlePreviewModal 
                              article={article} 
                              onPublish={() => handlePublish(article.id)} 
                            />
                          </Dialog>

                          {/* Edit Button */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <ArticleEditModal 
                              article={article}
                              onSave={(updates) => handleSaveEdit(article.id, updates)}
                              isSaving={isSaving}
                            />
                          </Dialog>

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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <ArticleEditModal 
                            article={article}
                            onSave={(updates) => handleSaveEdit(article.id, updates)}
                            isSaving={isSaving}
                          />
                        </Dialog>
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
