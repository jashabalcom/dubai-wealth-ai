import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ArrowLeft, Star, Building, Video, FileText, Map, Upload } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { BulkProjectImporter } from '@/components/admin/BulkProjectImporter';
import { DocumentUploader } from '@/components/admin/DocumentUploader';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface DeveloperProject {
  id: string;
  developer_id: string;
  name: string;
  slug: string;
  description: string | null;
  location_area: string | null;
  status: string | null;
  project_type: string | null;
  completion_year: number | null;
  total_units: number | null;
  image_url: string | null;
  is_flagship: boolean | null;
  // Media fields
  video_url: string | null;
  virtual_tour_url: string | null;
  // Document fields
  brochure_url: string | null;
  sales_deck_url: string | null;
  master_plan_url: string | null;
  location_map_url: string | null;
}

export default function AdminDeveloperProjects() {
  const { developerId } = useParams<{ developerId: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<DeveloperProject | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    location_area: '',
    status: 'under_construction',
    project_type: 'Mixed Use',
    completion_year: new Date().getFullYear() + 2,
    total_units: 0,
    image_url: '',
    is_flagship: false,
    // Media fields
    video_url: '',
    virtual_tour_url: '',
    // Document fields
    brochure_url: '',
    sales_deck_url: '',
    master_plan_url: '',
    location_map_url: '',
  });

  const { data: developer } = useQuery({
    queryKey: ['developer', developerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developers')
        .select('name')
        .eq('id', developerId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!developerId,
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['developer-projects', developerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('developer_projects')
        .select('*')
        .eq('developer_id', developerId)
        .order('is_flagship', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as DeveloperProject[];
    },
    enabled: !!developerId,
  });

  const createProject = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('developer_projects').insert({
        ...data,
        developer_id: developerId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-projects', developerId] });
      toast.success('Project created');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create project: ' + error.message);
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...data }: typeof formData & { id: string }) => {
      const { error } = await supabase.from('developer_projects').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-projects', developerId] });
      toast.success('Project updated');
      resetForm();
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('developer_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-projects', developerId] });
      toast.success('Project deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      location_area: '',
      status: 'under_construction',
      project_type: 'Mixed Use',
      completion_year: new Date().getFullYear() + 2,
      total_units: 0,
      image_url: '',
      is_flagship: false,
      video_url: '',
      virtual_tour_url: '',
      brochure_url: '',
      sales_deck_url: '',
      master_plan_url: '',
      location_map_url: '',
    });
    setEditingProject(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (project: DeveloperProject) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      slug: project.slug,
      description: project.description || '',
      location_area: project.location_area || '',
      status: project.status || 'under_construction',
      project_type: project.project_type || 'Mixed Use',
      completion_year: project.completion_year || new Date().getFullYear() + 2,
      total_units: project.total_units || 0,
      image_url: project.image_url || '',
      is_flagship: project.is_flagship || false,
      video_url: project.video_url || '',
      virtual_tour_url: project.virtual_tour_url || '',
      brochure_url: project.brochure_url || '',
      sales_deck_url: project.sales_deck_url || '',
      master_plan_url: project.master_plan_url || '',
      location_map_url: project.location_map_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProject.mutate({ id: editingProject.id, ...formData });
    } else {
      createProject.mutate(formData);
    }
  };

  return (
    <AdminLayout title="Project Manager">
      <div className="mb-6">
        <Link to="/admin/developers" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Developers
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{developer?.name || 'Developer'} Projects</h2>
            <p className="text-sm text-muted-foreground">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} in portfolio
            </p>
          </div>
          <div className="flex gap-2">
            <BulkProjectImporter 
              developerId={developerId!} 
              onImportComplete={() => queryClient.invalidateQueries({ queryKey: ['developer-projects', developerId] })} 
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gold hover:bg-gold/90 text-background" onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Media
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Documents
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Project Image</Label>
                        <div className="mt-2">
                          <ImageUploader
                            currentImageUrl={formData.image_url || null}
                            onUpload={(url) => setFormData({ ...formData, image_url: url })}
                            folder={`projects/${developerId}`}
                            aspectRatio={4/3}
                            label="Project Image"
                            previewClassName="w-full h-48"
                          />
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Project Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            name: e.target.value,
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
                        <Label>Location Area</Label>
                        <Input
                          value={formData.location_area}
                          onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                          placeholder="Dubai Marina, Downtown Dubai..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="under_construction">Under Construction</SelectItem>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Project Type</Label>
                        <Input
                          value={formData.project_type}
                          onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                          placeholder="Residential, Commercial, Mixed Use..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Completion Year</Label>
                        <Input
                          type="number"
                          value={formData.completion_year}
                          onChange={(e) => setFormData({ ...formData, completion_year: Number(e.target.value) })}
                          min={2000}
                          max={2040}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total Units</Label>
                        <Input
                          type="number"
                          value={formData.total_units}
                          onChange={(e) => setFormData({ ...formData, total_units: Number(e.target.value) })}
                          min={0}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Switch
                          checked={formData.is_flagship}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_flagship: checked })}
                        />
                        <Label>Flagship Project</Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="media" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          Video URL
                        </Label>
                        <Input
                          value={formData.video_url}
                          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Supports YouTube, Vimeo, or direct video URLs
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          Virtual Tour URL
                        </Label>
                        <Input
                          value={formData.virtual_tour_url}
                          onChange={(e) => setFormData({ ...formData, virtual_tour_url: e.target.value })}
                          placeholder="https://my.matterport.com/... or tour embed URL"
                        />
                        <p className="text-xs text-muted-foreground">
                          Matterport, Kuula, or other 360° tour embeds
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Brochure
                        </Label>
                        <DocumentUploader
                          value={formData.brochure_url}
                          onChange={(url) => setFormData({ ...formData, brochure_url: url })}
                          folder={`brochures/${developerId}`}
                          label="Brochure"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          Sales Deck
                        </Label>
                        <DocumentUploader
                          value={formData.sales_deck_url}
                          onChange={(url) => setFormData({ ...formData, sales_deck_url: url })}
                          folder={`sales-decks/${developerId}`}
                          label="Sales Deck"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          Master Plan
                        </Label>
                        <DocumentUploader
                          value={formData.master_plan_url}
                          onChange={(url) => setFormData({ ...formData, master_plan_url: url })}
                          folder={`master-plans/${developerId}`}
                          label="Master Plan"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          Location Map
                        </Label>
                        <DocumentUploader
                          value={formData.location_map_url}
                          onChange={(url) => setFormData({ ...formData, location_map_url: url })}
                          folder={`location-maps/${developerId}`}
                          label="Location Map"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      <Upload className="h-3 w-3 inline mr-1" />
                      Upload files directly or paste URLs. These will appear in the project's Documents section.
                    </p>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" className="bg-gold hover:bg-gold/90 text-background">
                    {editingProject ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">No projects yet. Add your first project.</div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-[4/3] relative bg-muted">
                {project.image_url ? (
                  <img src={project.image_url} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {project.is_flagship && (
                  <div className="absolute top-2 left-2 bg-gold text-background px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Flagship
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{project.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{project.location_area || 'No location'}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                    project.status === 'under_construction' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {project.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{project.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteProject.mutate(project.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
