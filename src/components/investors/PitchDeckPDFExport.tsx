import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createPortal } from "react-dom";

// Import all slide components
import { TitleSlide } from "./slides/TitleSlide";
import { ProblemSlide } from "./slides/ProblemSlide";
import { SolutionSlide } from "./slides/SolutionSlide";
import { MarketSlide } from "./slides/MarketSlide";
import { ProductSlide } from "./slides/ProductSlide";
import { BusinessModelSlide } from "./slides/BusinessModelSlide";
import { TractionSlide } from "./slides/TractionSlide";
import { UnitEconomicsSlide } from "./slides/UnitEconomicsSlide";
import { CompetitionSlide } from "./slides/CompetitionSlide";
import { GTMSlide } from "./slides/GTMSlide";
import { FinancialsSlide } from "./slides/FinancialsSlide";
import { TeamSlide } from "./slides/TeamSlide";
import { UseOfFundsSlide } from "./slides/UseOfFundsSlide";
import { AskSlide } from "./slides/AskSlide";
import { AppStoreSlide } from "./slides/AppStoreSlide";

const slideComponents = [
  TitleSlide,
  ProblemSlide,
  SolutionSlide,
  MarketSlide,
  ProductSlide,
  BusinessModelSlide,
  TractionSlide,
  UnitEconomicsSlide,
  CompetitionSlide,
  GTMSlide,
  FinancialsSlide,
  AppStoreSlide,
  TeamSlide,
  UseOfFundsSlide,
  AskSlide
];

// Dark theme CSS variables resolved to actual values
const darkThemeStyles = `
  :root {
    --background: 220 40% 8% !important;
    --foreground: 40 20% 92% !important;
    --card: 220 30% 12% !important;
    --card-foreground: 40 20% 92% !important;
    --popover: 220 30% 12% !important;
    --popover-foreground: 40 20% 92% !important;
    --primary: 38 72% 50% !important;
    --primary-foreground: 220 40% 8% !important;
    --secondary: 220 25% 18% !important;
    --secondary-foreground: 40 20% 92% !important;
    --muted: 220 25% 18% !important;
    --muted-foreground: 40 10% 65% !important;
    --accent: 38 72% 50% !important;
    --accent-foreground: 220 40% 8% !important;
    --destructive: 0 62% 50% !important;
    --destructive-foreground: 40 20% 92% !important;
    --border: 220 20% 25% !important;
    --input: 220 20% 25% !important;
    --ring: 38 72% 50% !important;
  }
`;

export const FullPDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: slideComponents.length });
  const [renderSlides, setRenderSlides] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const captureSlides = useCallback(async () => {
    // Wait for slides to render
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [1920, 1080]
    });

    for (let i = 0; i < slideRefs.current.length; i++) {
      const slideEl = slideRefs.current[i];
      if (!slideEl) continue;

      setProgress({ current: i + 1, total: slideComponents.length });

      try {
        const canvas = await html2canvas(slideEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#0f172a',
          width: 1920,
          height: 1080,
          onclone: (clonedDoc) => {
            // Inject dark theme styles
            const style = clonedDoc.createElement('style');
            style.textContent = darkThemeStyles;
            clonedDoc.head.appendChild(style);
            
            // Force dark class on root
            clonedDoc.documentElement.classList.add('dark');
            
            // Apply explicit background colors to common elements
            const elements = clonedDoc.querySelectorAll('*');
            elements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const computedStyle = window.getComputedStyle(htmlEl);
              
              // Fix transparent backgrounds that should be dark
              if (computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' || 
                  computedStyle.backgroundColor === 'transparent') {
                // Don't override, let parent show through
              }
            });
          }
        });

        if (i > 0) {
          pdf.addPage([1920, 1080], 'landscape');
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080);
      } catch (error) {
        console.error(`Failed to capture slide ${i + 1}:`, error);
      }
    }

    pdf.save('Dubai-Wealth-Hub-Pitch-Deck.pdf');
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: slideComponents.length });
    setRenderSlides(true);

    // Wait for React to render the slides
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      await captureSlides();
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
      setRenderSlides(false);
      setProgress({ current: 0, total: slideComponents.length });
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={handleExport}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {progress.current}/{progress.total}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export PDF
          </>
        )}
      </Button>

      {/* Hidden render container for all slides */}
      {renderSlides && createPortal(
        <div 
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '1920px',
            zIndex: -1,
            backgroundColor: '#0f172a',
            color: '#f1f0ee'
          }}
          className="dark"
        >
          {slideComponents.map((SlideComponent, index) => (
            <div
              key={index}
              ref={(el) => { slideRefs.current[index] = el; }}
              style={{
                width: '1920px',
                height: '1080px',
                backgroundColor: '#0f172a',
                color: '#f1f0ee',
                overflow: 'hidden',
                position: 'relative'
              }}
              className="dark"
            >
              <SlideComponent />
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

// Keep SimplePDFExport for backward compatibility
export const SimplePDFExport = FullPDFExport;
