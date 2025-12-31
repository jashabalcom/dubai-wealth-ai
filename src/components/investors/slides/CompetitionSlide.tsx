import { PitchDeckSlide } from "../PitchDeckSlide";
import { Check, X } from "lucide-react";

const competitors = [
  { name: "Bayut/Dubizzle", listings: true, tools: false, academy: false, ai: false, community: false },
  { name: "Property Finder", listings: true, tools: false, academy: false, ai: false, community: false },
  { name: "Generic PropTech", listings: true, tools: true, academy: false, ai: false, community: false },
  { name: "Dubai Wealth Hub", listings: true, tools: true, academy: true, ai: true, community: true }
];

export const CompetitionSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">COMPETITIVE LANDSCAPE</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          The Only Complete Platform
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4"></th>
              <th className="text-center py-4 px-4">Listings</th>
              <th className="text-center py-4 px-4">Tools</th>
              <th className="text-center py-4 px-4">Academy</th>
              <th className="text-center py-4 px-4">AI</th>
              <th className="text-center py-4 px-4">Community</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((comp, i) => (
              <tr 
                key={i} 
                className={`border-b border-border ${comp.name === "Dubai Wealth Hub" ? "bg-primary/10" : ""}`}
              >
                <td className={`py-4 px-4 font-medium ${comp.name === "Dubai Wealth Hub" ? "text-primary font-bold" : ""}`}>
                  {comp.name}
                </td>
                <td className="text-center py-4 px-4">
                  {comp.listings ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                </td>
                <td className="text-center py-4 px-4">
                  {comp.tools ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                </td>
                <td className="text-center py-4 px-4">
                  {comp.academy ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                </td>
                <td className="text-center py-4 px-4">
                  {comp.ai ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                </td>
                <td className="text-center py-4 px-4">
                  {comp.community ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-primary mb-2">Moat #1</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Vertical Integration:</span> Only platform combining listings, education, tools, and community
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-accent mb-2">Moat #2</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Domain Expertise:</span> Deep Dubai-specific content not replicable by generalists
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold text-primary mb-2">Moat #3</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Network Effects:</span> Community and agent network creates switching costs
          </p>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
