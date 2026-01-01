import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  RefreshCw, 
  Plus, 
  Trash2, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Clock,
  Rss,
  Globe,
  Star
} from 'lucide-react';
import { useNewsSources, NewsSource } from '@/hooks/useNewsSources';
import { formatDistanceToNow } from 'date-fns';

export default function AdminNewsSources() {
  const { 
    sources, 
    isLoading, 
    stats,
    toggleSource, 
    addSource, 
    deleteSource,
    syncSource,
    syncAllSources 
  } = useNewsSources();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    feed_type: 'rss' as 'rss' | 'scrape' | 'api',
    tier: 2,
    keywords: '',
    sync_frequency: 'daily',
  });

  const handleAddSource = () => {
    addSource.mutate({
      name: newSource.name,
      url: newSource.url,
      feed_type: newSource.feed_type,
      tier: newSource.tier,
      keywords: newSource.keywords.split(',').map(k => k.trim()).filter(Boolean),
      sync_frequency: newSource.sync_frequency,
    });
    setIsAddDialogOpen(false);
    setNewSource({ name: '', url: '', feed_type: 'rss', tier: 2, keywords: '', sync_frequency: 'daily' });
  };

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1:
        return <Badge className="bg-gold text-background"><Star className="h-3 w-3 mr-1" />Premium</Badge>;
      case 2:
        return <Badge variant="secondary">Standard</Badge>;
      case 3:
        return <Badge variant="outline">Supplementary</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFeedTypeBadge = (type: string) => {
    switch (type) {
      case 'rss':
        return <Badge variant="outline" className="text-blue-500 border-blue-500"><Rss className="h-3 w-3 mr-1" />RSS</Badge>;
      case 'scrape':
        return <Badge variant="outline" className="text-purple-500 border-purple-500"><Globe className="h-3 w-3 mr-1" />Scrape</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="News Sources">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="News Sources">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Sources</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{stats.active}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gold">{stats.tier1}</div>
              <div className="text-xs text-muted-foreground">Premium</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.rss}</div>
              <div className="text-xs text-muted-foreground">RSS Feeds</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.totalArticles}</div>
              <div className="text-xs text-muted-foreground">Articles Synced</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{stats.withErrors}</div>
              <div className="text-xs text-muted-foreground">With Errors</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Sources</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => syncAllSources.mutate()}
              disabled={syncAllSources.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncAllSources.isPending ? 'animate-spin' : ''}`} />
              Sync All Sources
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add News Source</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input 
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      placeholder="Gulf News Property"
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input 
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                      placeholder="https://example.com/rss/feed.xml"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Feed Type</Label>
                      <Select 
                        value={newSource.feed_type} 
                        onValueChange={(v) => setNewSource({ ...newSource, feed_type: v as 'rss' | 'scrape' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rss">RSS Feed</SelectItem>
                          <SelectItem value="scrape">Web Scrape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Tier</Label>
                      <Select 
                        value={String(newSource.tier)} 
                        onValueChange={(v) => setNewSource({ ...newSource, tier: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Premium (Tier 1)</SelectItem>
                          <SelectItem value="2">Standard (Tier 2)</SelectItem>
                          <SelectItem value="3">Supplementary (Tier 3)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Sync Frequency</Label>
                    <Select 
                      value={newSource.sync_frequency} 
                      onValueChange={(v) => setNewSource({ ...newSource, sync_frequency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Keywords (comma-separated)</Label>
                    <Input 
                      value={newSource.keywords}
                      onChange={(e) => setNewSource({ ...newSource, keywords: e.target.value })}
                      placeholder="dubai, property, real estate"
                    />
                  </div>
                  <Button onClick={handleAddSource} className="w-full" disabled={addSource.isPending}>
                    {addSource.isPending ? 'Adding...' : 'Add Source'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Sources List */}
        <div className="space-y-4">
          {sources?.map((source) => (
            <Card key={source.id} className={!source.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold truncate">{source.name}</h4>
                      {getTierBadge(source.tier)}
                      {getFeedTypeBadge(source.feed_type)}
                      {source.error_count > 0 && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {source.error_count} errors
                        </Badge>
                      )}
                    </div>
                    
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">{source.url}</span>
                    </a>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {source.articles_synced} articles
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {source.sync_frequency}
                      </span>
                      {source.last_synced_at && (
                        <span>
                          Last sync: {formatDistanceToNow(new Date(source.last_synced_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {source.keywords && source.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {source.keywords.slice(0, 5).map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                        {source.keywords.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{source.keywords.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {source.last_error && (
                      <p className="text-xs text-red-500 mt-2 truncate">
                        Error: {source.last_error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => syncSource.mutate(source.id)}
                      disabled={syncSource.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 ${syncSource.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={(checked) => toggleSource.mutate({ id: source.id, is_active: checked })}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => deleteSource.mutate(source.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
