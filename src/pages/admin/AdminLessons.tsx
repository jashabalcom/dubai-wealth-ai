import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit, Trash2, ArrowLeft, GripVertical, 
  Eye, EyeOff, Video, FileText, Upload
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { ResourceUploader } from '@/components/admin/ResourceUploader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface Resource {
  name: string;
  url: string;
  type: string;
}

export default function AdminLessons() {
  const { courseId } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    video_url: '',
    duration_minutes: 0,
    order_index: 0,
    is_free_preview: false,
    resources: [] as Resource[],
  });

  // Fetch course info
  const { data: course } = useQuery({
    queryKey: ['admin-course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  // Fetch lessons
  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['admin-lessons', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });

  const createLesson = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('lessons').insert([{
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        video_url: data.video_url,
        duration_minutes: data.duration_minutes,
        order_index: data.order_index,
        is_free_preview: data.is_free_preview,
        course_id: courseId!,
        resources: JSON.parse(JSON.stringify(data.resources)),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', courseId] });
      toast.success('Lesson created');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create lesson: ' + error.message);
    },
  });

  const updateLesson = useMutation({
    mutationFn: async ({ id, ...data }: typeof formData & { id: string }) => {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: data.title,
          slug: data.slug,
          description: data.description,
          content: data.content,
          video_url: data.video_url,
          duration_minutes: data.duration_minutes,
          order_index: data.order_index,
          is_free_preview: data.is_free_preview,
          resources: JSON.parse(JSON.stringify(data.resources)),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', courseId] });
      toast.success('Lesson updated');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update lesson: ' + error.message);
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', courseId] });
      toast.success('Lesson deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      video_url: '',
      duration_minutes: 0,
      order_index: lessons.length + 1,
      is_free_preview: false,
      resources: [],
    });
    setEditingLesson(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description || '',
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes || 0,
      order_index: lesson.order_index,
      is_free_preview: lesson.is_free_preview,
      resources: Array.isArray(lesson.resources) ? lesson.resources as Resource[] : [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLesson) {
      updateLesson.mutate({ id: editingLesson.id, ...formData });
    } else {
      createLesson.mutate(formData);
    }
  };

  const handleOpenNew = () => {
    resetForm();
    setFormData(prev => ({ ...prev, order_index: lessons.length + 1 }));
    setIsDialogOpen(true);
  };

  const handleResourcesChange = (resources: Resource[]) => {
    setFormData(prev => ({ ...prev, resources }));
  };

  return (
    <AdminLayout title={course ? `Lessons: ${course.title}` : 'Manage Lessons'}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
          <p className="text-muted-foreground">
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button 
          className="bg-gold hover:bg-gold/90 text-background" 
          onClick={handleOpenNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* Lessons Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No lessons yet. Add your first lesson to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                      {lesson.order_index}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {lesson.duration_minutes}min
                  </TableCell>
                  <TableCell>
                    {lesson.video_url ? (
                      <Video className="h-4 w-4 text-gold" />
                    ) : (
                      <Video className="h-4 w-4 text-muted-foreground/30" />
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {(Array.isArray(lesson.resources) ? lesson.resources.length : 0)} files
                    </span>
                  </TableCell>
                  <TableCell>
                    {lesson.is_free_preview ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-500">
                        <Eye className="h-3 w-3" />
                        Free
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                        <EyeOff className="h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(lesson)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteLesson.mutate(lesson.id)} 
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Lesson Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    title: e.target.value, 
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Order Index</Label>
                <Input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.is_free_preview}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_free_preview: checked })}
                />
                <Label>Free Preview</Label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Video URL
              </Label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="YouTube, Vimeo, or direct video URL"
              />
              <p className="text-xs text-muted-foreground">
                Supports YouTube, Vimeo, and direct video URLs (mp4, webm)
              </p>
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Lesson Content
              </Label>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Downloadable Resources
              </Label>
              <ResourceUploader
                resources={formData.resources}
                onChange={handleResourcesChange}
                courseId={courseId || ''}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gold hover:bg-gold/90 text-background">
                {editingLesson ? 'Update Lesson' : 'Create Lesson'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
