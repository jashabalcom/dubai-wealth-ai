import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropertyNotes } from '@/hooks/usePropertyNotes';
import { useAuth } from '@/hooks/useAuth';
import { StickyNote, Trash2, Check, Loader2, Lock, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface PropertyNotesCardProps {
  propertyId: string;
}

const MAX_CHARS = 1000;

export function PropertyNotesCard({ propertyId }: PropertyNotesCardProps) {
  const { user, profile } = useAuth();
  const isElite = profile?.membership_tier === 'elite';
  const { note, isLoading, isSaving, saveNote, saveNoteImmediate, deleteNote, isDeleting } = usePropertyNotes(propertyId);
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (note?.content) {
      setContent(note.content);
    }
  }, [note?.content]);

  const handleChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setContent(value);
      setHasChanges(true);
      saveNote(value);
    }
  };

  const handleBlur = () => {
    if (hasChanges && content.trim()) {
      saveNoteImmediate(content);
      setHasChanges(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote();
      setContent('');
    }
  };

  if (!user) return null;

  // Locked state for non-Elite members
  if (!isElite) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
          <Lock className="w-8 h-8 text-muted-foreground mb-3" />
          <h4 className="font-semibold text-foreground mb-1">Elite Feature</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Property notes are available for Elite members
          </p>
          <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
            <Link to="/upgrade">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Elite
            </Link>
          </Button>
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <StickyNote className="w-5 h-5 text-primary" />
            My Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-muted/30 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <StickyNote className="w-5 h-5 text-primary" />
            My Notes
            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
              Elite
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {!isSaving && note && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Add private notes about this property... (investment analysis, negotiation points, reminders)"
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className="min-h-[100px] resize-none bg-background/50 border-border/50 focus:border-primary/50"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={content.length > MAX_CHARS * 0.9 ? 'text-amber-500' : ''}>
            {content.length}/{MAX_CHARS} characters
          </span>
          <div className="flex items-center gap-3">
            {note?.updated_at && (
              <span>
                Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
              </span>
            )}
            {note && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
