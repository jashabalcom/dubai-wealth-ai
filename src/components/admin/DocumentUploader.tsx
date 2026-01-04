import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  accept?: string;
  placeholder?: string;
}

export function DocumentUploader({ 
  value, 
  onChange, 
  folder, 
  label = 'Document',
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
  placeholder = 'https://... or upload a file'
}: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success(`${label} uploaded successfully`);
    } catch (error: any) {
      toast.error(`Failed to upload: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload file"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
        {value && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => window.open(value, '_blank')}
              title="Preview"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleClear}
              className="text-destructive hover:text-destructive"
              title="Clear"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      {value && (
        <p className="text-xs text-muted-foreground truncate">
          <FileText className="h-3 w-3 inline mr-1" />
          {value.split('/').pop()}
        </p>
      )}
    </div>
  );
}
