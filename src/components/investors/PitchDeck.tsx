import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Home } from "lucide-react";
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
import { SimplePDFExport } from "./PitchDeckPDFExport";

const slides = [
  { id: 1, title: "Title", component: TitleSlide },
  { id: 2, title: "Problem", component: ProblemSlide },
  { id: 3, title: "Solution", component: SolutionSlide },
  { id: 4, title: "Market", component: MarketSlide },
  { id: 5, title: "Product", component: ProductSlide },
  { id: 6, title: "Business Model", component: BusinessModelSlide },
  { id: 7, title: "Traction", component: TractionSlide },
  { id: 8, title: "Unit Economics", component: UnitEconomicsSlide },
  { id: 9, title: "Competition", component: CompetitionSlide },
  { id: 10, title: "Go-to-Market", component: GTMSlide },
  { id: 11, title: "Financials", component: FinancialsSlide },
  { id: 12, title: "App Distribution", component: AppStoreSlide },
  { id: 13, title: "Team", component: TeamSlide },
  { id: 14, title: "Use of Funds", component: UseOfFundsSlide },
  { id: 15, title: "The Ask", component: AskSlide }
];

export const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div className={`flex flex-col ${isFullscreen ? 'h-screen' : 'min-h-[80vh]'} bg-background`}>
      {/* Top Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => goToSlide(0)}>
            <Home className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <SimplePDFExport />
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Slide Thumbnails */}
      <div className="flex gap-2 p-4 overflow-x-auto border-b border-border bg-muted/30">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentSlide === index
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:border-primary/50'
            }`}
          >
            {slide.title}
          </button>
        ))}
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <CurrentSlideComponent key={currentSlide} />
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-card/50">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-1">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
