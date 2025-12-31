import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PitchDeckPDFExportProps {
  slideRefs: React.RefObject<HTMLDivElement>[];
  onExportStart?: () => void;
  onExportEnd?: () => void;
}

export const PitchDeckPDFExport = ({ 
  slideRefs, 
  onExportStart, 
  onExportEnd 
}: PitchDeckPDFExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportToPDF = async () => {
    setIsExporting(true);
    setProgress(0);
    onExportStart?.();

    try {
      // Create PDF in landscape orientation (16:9 aspect ratio)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080]
      });

      for (let i = 0; i < slideRefs.length; i++) {
        const slideRef = slideRefs[i];
        if (!slideRef.current) continue;

        // Capture slide as canvas
        const canvas = await html2canvas(slideRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#0a0a0f',
          width: 1920,
          height: 1080
        });

        // Add new page for all slides except first
        if (i > 0) {
          pdf.addPage([1920, 1080], 'landscape');
        }

        // Add image to PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080);

        // Update progress
        setProgress(Math.round(((i + 1) / slideRefs.length) * 100));
      }

      // Download PDF
      pdf.save('Dubai-Wealth-Hub-Pitch-Deck.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
      setProgress(0);
      onExportEnd?.();
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2"
      onClick={exportToPDF}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {progress}%
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
};

// Simplified export that captures current view
export const SimplePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportCurrentView = async () => {
    setIsExporting(true);
    
    try {
      const slideContainer = document.querySelector('[data-pitch-deck-content]');
      if (!slideContainer) {
        console.error('Slide container not found');
        return;
      }

      const canvas = await html2canvas(slideContainer as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0a0a0f'
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save('Dubai-Wealth-Hub-Slide.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2"
      onClick={exportCurrentView}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export PDF
    </Button>
  );
};
