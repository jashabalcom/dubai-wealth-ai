import { Download, FileText, FileSpreadsheet, FileImage, File, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Resource {
  name: string;
  url: string;
  type: string;
}

interface ResourceListProps {
  resources: Resource[];
}

export function ResourceList({ resources }: ResourceListProps) {
  if (!resources || resources.length === 0) {
    return null;
  }

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pdf') return <FileText className="h-5 w-5 text-red-400" />;
    if (['doc', 'docx', 'txt'].includes(t)) return <FileText className="h-5 w-5 text-blue-400" />;
    if (['xls', 'xlsx', 'csv'].includes(t)) return <FileSpreadsheet className="h-5 w-5 text-green-400" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(t)) return <FileImage className="h-5 w-5 text-purple-400" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
        <Download className="h-5 w-5 text-gold" />
        Lesson Resources
      </h3>
      <div className="space-y-3">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex-shrink-0">
              {getFileIcon(resource.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate group-hover:text-gold transition-colors">
                {resource.name}
              </p>
              <p className="text-xs text-muted-foreground uppercase">
                {resource.type} file
              </p>
            </div>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        ))}
      </div>
    </div>
  );
}
