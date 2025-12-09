import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileImage, 
  Upload, 
  Trash2, 
  GripVertical,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FloorPlan {
  id: string;
  property_id: string;
  url: string;
  storage_path: string | null;
  title: string | null;
  floor_number: number | null;
  order_index: number;
}

interface FloorPlansManagerProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FloorPlansManager({ propertyId, open, onOpenChange }: FloorPlansManagerProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const { data: floorPlans = [], isLoading } = useQuery({
    queryKey: ['property-floor-plans', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_floor_plans')
        .select('*')
        .eq('property_id', propertyId)
        .order('order_index');
      
      if (error) throw error;
      return data as FloorPlan[];
    },
    enabled: open && !!propertyId,
  });

  const uploadFloorPlan = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `floor-plans/${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('property-media')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-media')
        .getPublicUrl(fileName);

      const maxOrder = floorPlans.length > 0 ? Math.max(...floorPlans.map(fp => fp.order_index ?? 0)) + 1 : 0;

      const { error: insertError } = await supabase
        .from('property_floor_plans')
        .insert({
          property_id: propertyId,
          url: publicUrl,
          storage_path: fileName,
          title: file.name.replace(/\.[^/.]+$/, ''),
          order_index: maxOrder,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-floor-plans', propertyId] });
      toast.success('Floor plan uploaded');
    },
    onError: (error) => {
      toast.error('Upload failed: ' + error.message);
    },
  });

  const updateFloorPlan = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FloorPlan> }) => {
      const { error } = await supabase
        .from('property_floor_plans')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-floor-plans', propertyId] });
    },
  });

  const deleteFloorPlan = useMutation({
    mutationFn: async (floorPlan: FloorPlan) => {
      if (floorPlan.storage_path) {
        await supabase.storage
          .from('property-media')
          .remove([floorPlan.storage_path]);
      }

      const { error } = await supabase
        .from('property_floor_plans')
        .delete()
        .eq('id', floorPlan.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-floor-plans', propertyId] });
      toast.success('Floor plan deleted');
    },
  });

  const reorderFloorPlans = useMutation({
    mutationFn: async (reordered: FloorPlan[]) => {
      const updates = reordered.map((fp, index) => 
        supabase
          .from('property_floor_plans')
          .update({ order_index: index })
          .eq('id', fp.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-floor-plans', propertyId] });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadFloorPlan.mutateAsync(files[i]);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = floorPlans.findIndex(fp => fp.id === draggedItem);
    const targetIndex = floorPlans.findIndex(fp => fp.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const reordered = [...floorPlans];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    reorderFloorPlans.mutate(reordered);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const isImageFile = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Floor Plans Manager
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              id="floor-plan-upload"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <label
              htmlFor="floor-plan-upload"
              className={cn(
                "cursor-pointer flex flex-col items-center gap-2",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Uploading... {Math.round(uploadProgress)}%
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload floor plans
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP, PDF up to 10MB
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Floor Plans List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : floorPlans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No floor plans yet. Upload your first floor plan above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {floorPlans.map((floorPlan) => (
                <div
                  key={floorPlan.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, floorPlan.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, floorPlan.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-4 p-3 bg-muted/50 rounded-lg border-2 transition-all",
                    draggedItem === floorPlan.id ? "opacity-50 border-gold" : "border-transparent"
                  )}
                >
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {isImageFile(floorPlan.url) ? (
                      <img
                        src={floorPlan.url}
                        alt={floorPlan.title || 'Floor plan'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileImage className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Title</label>
                      <Input
                        value={floorPlan.title || ''}
                        onChange={(e) => updateFloorPlan.mutate({ 
                          id: floorPlan.id, 
                          updates: { title: e.target.value } 
                        })}
                        placeholder="e.g. Ground Floor"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Floor Number</label>
                      <Input
                        type="number"
                        value={floorPlan.floor_number ?? ''}
                        onChange={(e) => updateFloorPlan.mutate({ 
                          id: floorPlan.id, 
                          updates: { floor_number: e.target.value ? parseInt(e.target.value) : null } 
                        })}
                        placeholder="e.g. 1"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => window.open(floorPlan.url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8"
                      onClick={() => deleteFloorPlan.mutate(floorPlan)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {floorPlans.length} floor plan{floorPlans.length !== 1 ? 's' : ''} • Drag to reorder
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
