import { useState, RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface PDFExportButtonProps {
  containerRef: RefObject<HTMLDivElement>;
  filename?: string;
  pageCount: number;
}

export function PDFExportButton({ 
  containerRef, 
  filename = "Dubai-Investment-Secrets-2025.pdf",
  pageCount 
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    if (!containerRef.current) {
      toast.error("No content to export");
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      const pages = containerRef.current.querySelectorAll('[data-pdf-page]');
      
      if (pages.length === 0) {
        toast.error("No pages found to export");
        setIsExporting(false);
        return;
      }

      // Letter size in points (72 DPI)
      const pageWidth = 612; // 8.5 inches
      const pageHeight = 792; // 11 inches
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Force dark theme styles for consistent rendering
        const originalBg = page.style.backgroundColor;
        
        const canvas = await html2canvas(page, {
          scale: 2, // Higher quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
        });

        page.style.backgroundColor = originalBg;

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate dimensions to fit page
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        setProgress(Math.round(((i + 1) / pages.length) * 100));
      }

      pdf.save(filename);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="bg-primary text-secondary hover:bg-primary/90"
      size="lg"
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Exporting... {progress}%
        </>
      ) : (
        <>
          <Download className="mr-2 h-5 w-5" />
          Download PDF ({pageCount} pages)
        </>
      )}
    </Button>
  );
}
