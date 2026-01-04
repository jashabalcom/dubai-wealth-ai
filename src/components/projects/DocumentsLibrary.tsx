import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink, Image, FileSpreadsheet, Presentation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DocumentsLibraryProps {
  brochureUrl?: string | null;
  salesDeckUrl?: string | null;
  masterPlanUrl?: string | null;
  locationMapUrl?: string | null;
  projectName: string;
  brandColor?: string;
}

interface DocumentItem {
  title: string;
  description: string;
  url: string;
  icon: React.ElementType;
  type: string;
}

export function DocumentsLibrary({
  brochureUrl,
  salesDeckUrl,
  masterPlanUrl,
  locationMapUrl,
  projectName,
  brandColor,
}: DocumentsLibraryProps) {
  const documents: DocumentItem[] = [];

  if (brochureUrl) {
    documents.push({
      title: 'Project Brochure',
      description: `Download the complete ${projectName} brochure with specifications and pricing`,
      url: brochureUrl,
      icon: FileText,
      type: 'PDF',
    });
  }

  if (salesDeckUrl) {
    documents.push({
      title: 'Sales Presentation',
      description: 'Investment overview and key selling points',
      url: salesDeckUrl,
      icon: Presentation,
      type: 'PDF',
    });
  }

  if (masterPlanUrl) {
    documents.push({
      title: 'Master Plan',
      description: 'Complete community layout and development phases',
      url: masterPlanUrl,
      icon: Image,
      type: 'Image',
    });
  }

  if (locationMapUrl) {
    documents.push({
      title: 'Location Map',
      description: 'Area map showing nearby amenities and transportation',
      url: locationMapUrl,
      icon: FileSpreadsheet,
      type: 'Image',
    });
  }

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: brandColor ? `${brandColor}20` : 'hsl(var(--primary) / 0.1)' }}
        >
          <FileText 
            className="h-5 w-5"
            style={{ color: brandColor || 'hsl(var(--primary))' }}
          />
        </div>
        <h2 className="text-2xl font-semibold">Documents & Resources</h2>
      </div>

      <div className="grid gap-4">
        {documents.map((doc, index) => {
          const Icon = doc.icon;
          return (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="p-3 rounded-lg shrink-0"
                        style={{ backgroundColor: brandColor ? `${brandColor}10` : 'hsl(var(--muted))' }}
                      >
                        <Icon 
                          className="h-6 w-6"
                          style={{ color: brandColor || 'hsl(var(--foreground))' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {doc.type}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}