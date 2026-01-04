import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkProjectImporterProps {
  developerId: string;
  onImportComplete: () => void;
}

interface ParsedProject {
  name: string;
  location_area: string;
  status: string;
  completion_year: number | null;
  total_units: number | null;
  project_type: string;
  is_valid: boolean;
  error?: string;
}

const SAMPLE_CSV = `name,location_area,status,completion_year,total_units,project_type
Marina Tower,Dubai Marina,completed,2020,350,Residential
Downtown Heights,Downtown Dubai,under_construction,2026,500,Mixed Use
Creek Vista,Dubai Creek,upcoming,2028,200,Residential`;

export function BulkProjectImporter({ developerId, onImportComplete }: BulkProjectImporterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsedProjects, setParsedProjects] = useState<ParsedProject[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  const generateSlug = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const parseCSV = () => {
    if (!csvText.trim()) {
      toast.error('Please paste CSV data');
      return;
    }

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      toast.error('CSV must have a header row and at least one data row');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.indexOf('name');
    
    if (nameIndex === -1) {
      toast.error('CSV must have a "name" column');
      return;
    }

    const projects: ParsedProject[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (!values[nameIndex]) continue;

      const project: ParsedProject = {
        name: values[nameIndex] || '',
        location_area: values[headers.indexOf('location_area')] || '',
        status: values[headers.indexOf('status')] || 'under_construction',
        completion_year: parseInt(values[headers.indexOf('completion_year')]) || null,
        total_units: parseInt(values[headers.indexOf('total_units')]) || null,
        project_type: values[headers.indexOf('project_type')] || 'Mixed Use',
        is_valid: true,
      };

      // Validate
      if (!project.name) {
        project.is_valid = false;
        project.error = 'Name is required';
      } else if (!['completed', 'under_construction', 'upcoming', 'iconic'].includes(project.status)) {
        project.status = 'under_construction';
      }

      projects.push(project);
    }

    if (projects.length === 0) {
      toast.error('No valid projects found in CSV');
      return;
    }

    setParsedProjects(projects);
    setStep('preview');
  };

  const handleImport = async () => {
    const validProjects = parsedProjects.filter(p => p.is_valid);
    
    if (validProjects.length === 0) {
      toast.error('No valid projects to import');
      return;
    }

    setIsImporting(true);

    try {
      const projectsToInsert = validProjects.map(p => ({
        developer_id: developerId,
        name: p.name,
        slug: generateSlug(p.name),
        location_area: p.location_area || null,
        status: p.status,
        completion_year: p.completion_year,
        total_units: p.total_units,
        project_type: p.project_type,
        is_flagship: false,
      }));

      const { error } = await supabase
        .from('developer_projects')
        .insert(projectsToInsert);

      if (error) throw error;

      toast.success(`Successfully imported ${validProjects.length} projects`);
      onImportComplete();
      handleClose();
    } catch (error: any) {
      toast.error('Import failed: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCsvText('');
    setParsedProjects([]);
    setStep('input');
  };

  const validCount = parsedProjects.filter(p => p.is_valid).length;
  const invalidCount = parsedProjects.filter(p => !p.is_valid).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import Projects
          </DialogTitle>
        </DialogHeader>

        {step === 'input' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Paste CSV Data</Label>
              <Textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="name,location_area,status,completion_year,total_units,project_type"
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">CSV Format:</p>
              <code className="text-xs text-muted-foreground block whitespace-pre-wrap">
                {SAMPLE_CSV}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCsvText(SAMPLE_CSV)}
                className="mt-2"
              >
                Use Sample
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={parseCSV} className="bg-gold hover:bg-gold/90 text-background">
                Preview Import
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                {validCount} Valid
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <X className="h-3 w-3" />
                  {invalidCount} Invalid
                </Badge>
              )}
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Units</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProjects.map((project, index) => (
                    <TableRow key={index} className={!project.is_valid ? 'bg-destructive/10' : ''}>
                      <TableCell>
                        {project.is_valid ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.location_area || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.completion_year || '-'}</TableCell>
                      <TableCell>{project.total_units || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('input')}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button 
                  onClick={handleImport} 
                  disabled={validCount === 0 || isImporting}
                  className="bg-gold hover:bg-gold/90 text-background"
                >
                  {isImporting ? 'Importing...' : `Import ${validCount} Projects`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}