import { PitchDeckSlide } from "../PitchDeckSlide";
import { Check } from "lucide-react";

const features = {
  research: [
    "905+ curated property listings",
    "106 neighborhood profiles",
    "Developer database & ratings",
    "Market transaction data"
  ],
  education: [
    "50+ video lessons",
    "Investment courses",
    "Expert-led content",
    "Progress tracking"
  ],
  tools: [
    "ROI Calculator",
    "Mortgage Calculator",
    "Airbnb Yield Analyzer",
    "Cap Rate Calculator",
    "Golden Visa Wizard"
  ],
  ai: [
    "Property analysis",
    "Investment recommendations",
    "Dashboard insights",
    "Calculator explanations"
  ]
};

export const ProductSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-6">
      <div>
        <p className="text-primary font-semibold mb-2">PRODUCT</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          Full-Stack Investment Platform
        </h2>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-lg mb-4 text-primary">Research</h3>
          <ul className="space-y-2">
            {features.research.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-lg mb-4 text-accent">Academy</h3>
          <ul className="space-y-2">
            {features.education.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-accent flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-lg mb-4 text-primary">Tools</h3>
          <ul className="space-y-2">
            {features.tools.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-lg mb-4 text-accent">AI Features</h3>
          <ul className="space-y-2">
            {features.ai.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-accent flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="font-bold mb-3">Technology Stack</h3>
        <div className="flex flex-wrap gap-3">
          {["React", "TypeScript", "Supabase", "Stripe", "AI/ML", "Mapbox", "Real-time Sync"].map(tech => (
            <span key={tech} className="bg-background border border-border px-3 py-1 rounded-full text-sm">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
