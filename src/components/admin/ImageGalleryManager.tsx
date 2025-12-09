import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Star, 
  GripVertical,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const IMAGE_CATEGORIES = [
  { value: 'exterior', label: 'Exterior' },
  { value: 'interior', label: 'Interior' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'living', label: 'Living Room' },
  { value: 'view', label: 'View' },
  { value: 'amenity', label: 'Amenity' },
  { value: 'floor_plan', label: 'Floor Plan' },
];

interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  storage_path: string | null;
  category: string;
  caption: string | null;
  order_index: number;
  is_primary: boolean;
}

interface ImageGalleryManagerProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageGalleryManager({ propertyId, open, onOpenChange }: ImageGalleryManagerProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['property-images', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('order_index');
      
      if (error) throw error;
      return data as PropertyImage[];
    },
    enabled: open && !!propertyId,
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-media')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-media')
        .getPublicUrl(fileName);

      const maxOrder = images.length > 0 ? Math.max(...images.map(i => i.order_index)) + 1 : 0;
      const isPrimary = images.length === 0;

      const { error: insertError } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          url: publicUrl,
          storage_path: fileName,
          category: 'interior',
          order_index: maxOrder,
          is_primary: isPrimary,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-images', propertyId] });
      toast.success('Image uploaded');
    },
    onError: (error) => {
      toast.error('Upload failed: ' + error.message);
    },
  });

  const updateImage = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PropertyImage> }) => {
      const { error } = await supabase
        .from('property_images')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-images', propertyId] });
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (image: PropertyImage) => {
      // Delete from storage if path exists
      if (image.storage_path) {
        await supabase.storage
          .from('property-media')
          .remove([image.storage_path]);
      }

      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', image.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-images', propertyId] });
      toast.success('Image deleted');
    },
  });

  const setPrimaryImage = useMutation({
    mutationFn: async (imageId: string) => {
      // First, unset all primary flags
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId);

      // Set the new primary
      const { error } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', imageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-images', propertyId] });
      toast.success('Primary image updated');
    },
  });

  const reorderImages = useMutation({
    mutationFn: async (reorderedImages: PropertyImage[]) => {
      const updates = reorderedImages.map((img, index) => 
        supabase
          .from('property_images')
          .update({ order_index: index })
          .eq('id', img.id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-images', propertyId] });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadImage.mutateAsync(files[i]);
        setUploadProgress(((i + 1) / files.length) * 100);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    setDraggedItem(imageId);
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

    const draggedIndex = images.findIndex(img => img.id === draggedItem);
    const targetIndex = images.findIndex(img => img.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    const reordered = [...images];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    reorderImages.mutate(reordered);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Gallery Manager
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            <label
              htmlFor="image-upload"
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
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Images Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No images yet. Upload your first image above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, image.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, image.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "relative group bg-muted rounded-lg overflow-hidden border-2 transition-all",
                    draggedItem === image.id ? "opacity-50 border-gold" : "border-transparent",
                    image.is_primary && "ring-2 ring-gold ring-offset-2 ring-offset-background"
                  )}
                >
                  {/* Drag Handle */}
                  <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-background/80 backdrop-blur rounded p-1 cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Primary Badge */}
                  {image.is_primary && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-gold text-background text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Primary
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-[4/3]">
                    <img
                      src={image.url}
                      alt={image.caption || 'Property image'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                      {/* Category Select */}
                      <Select
                        value={image.category}
                        onValueChange={(value) => updateImage.mutate({ id: image.id, updates: { category: value } })}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background/80 backdrop-blur">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Caption Input */}
                      <Input
                        value={image.caption || ''}
                        onChange={(e) => updateImage.mutate({ id: image.id, updates: { caption: e.target.value } })}
                        placeholder="Add caption..."
                        className="h-8 text-xs bg-background/80 backdrop-blur"
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {!image.is_primary && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1 h-7 text-xs"
                            onClick={() => setPrimaryImage.mutate(image.id)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Set Primary
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => deleteImage.mutate(image)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {images.length} image{images.length !== 1 ? 's' : ''} • Drag to reorder
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
