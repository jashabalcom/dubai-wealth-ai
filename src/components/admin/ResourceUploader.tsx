import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Resource {
  name: string;
  url: string;
  type: string;
}

interface ResourceUploaderProps {
  resources: Resource[];
  onChange: (resources: Resource[]) => void;
  courseId: string;
}

export function ResourceUploader({ resources, onChange, courseId }: ResourceUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newResources: Resource[] = [];

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${courseId}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course-content')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('course-content')
          .getPublicUrl(fileName);

        newResources.push({
          name: file.name,
          url: publicUrl,
          type: fileExt || 'file',
        });
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    onChange([...resources, ...newResources]);
    setUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeResource = (index: number) => {
    const updated = resources.filter((_, i) => i !== index);
    onChange(updated);
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-gold/50 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload PDFs, documents, or other resources
            </p>
            <p className="text-xs text-muted-foreground/60">
              PDF, DOC, XLS, PPT, ZIP, TXT
            </p>
          </div>
        )}
      </div>

      {/* Resource List */}
      {resources.length > 0 && (
        <div className="space-y-2">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              {getFileIcon(resource.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{resource.name}</p>
                <p className="text-xs text-muted-foreground uppercase">{resource.type}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeResource(index)}
                className="h-8 w-8 text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
