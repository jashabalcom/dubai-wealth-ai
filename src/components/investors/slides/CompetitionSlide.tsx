import { PitchDeckSlide } from "../PitchDeckSlide";
import { Check, X, Circle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from "recharts";

// Real competitor data based on actual platform analysis
const competitors = [
  { 
    name: "Bayut.com", 
    parent: "Dubizzle/EMPG",
    listings: true, 
    valuation: true, // TruEstimate
    aiSearch: true, // BayutGPT
    mortgageTools: false,
    investorEd: false, 
    roiTools: false,
    community: false,
    concierge: false,
  },
  { 
    name: "PropertyFinder", 
    parent: "PropertyFinder Group",
    listings: true, 
    valuation: true, // Value Finder Beta
    aiSearch: false,
    mortgageTools: true, // 20+ banks
    investorEd: false, 
    roiTools: false,
    community: false,
    concierge: false,
  },
  { 
    name: "Dubizzle", 
    parent: "Dubizzle/EMPG",
    listings: true, 
    valuation: false,
    aiSearch: false,
    mortgageTools: false,
    investorEd: false, 
    roiTools: false,
    community: false,
    concierge: false,
  },
  { 
    name: "Dubai Wealth Hub", 
    parent: "Independent",
    listings: true, 
    valuation: true,
    aiSearch: true,
    mortgageTools: true,
    investorEd: true, 
    roiTools: true,
    community: true,
    concierge: true,
  }
];

// Radar chart data for feature comparison
const radarData = [
  { feature: 'Listings', bayut: 90, pf: 85, dubizzle: 70, dwh: 75 },
  { feature: 'AI/Search', bayut: 70, pf: 40, dubizzle: 30, dwh: 85 },
  { feature: 'Tools', bayut: 40, pf: 50, dubizzle: 20, dwh: 95 },
  { feature: 'Education', bayut: 10, pf: 15, dubizzle: 5, dwh: 90 },
  { feature: 'Community', bayut: 5, pf: 10, dubizzle: 5, dwh: 85 },
  { feature: 'Concierge', bayut: 0, pf: 20, dubizzle: 0, dwh: 80 },
];

// Positioning matrix data
const positioningData = [
  { name: 'Bayut', x: 30, y: 45, z: 400, fill: 'hsl(var(--muted-foreground))' },
  { name: 'PropertyFinder', x: 35, y: 50, z: 350, fill: 'hsl(var(--muted-foreground))' },
  { name: 'Dubizzle', x: 20, y: 25, z: 300, fill: 'hsl(var(--muted-foreground))' },
  { name: 'Dubai Wealth Hub', x: 85, y: 90, z: 200, fill: 'hsl(var(--primary))' },
];

const FeatureIcon = ({ has }: { has: boolean }) => (
  has 
    ? <Check className="h-4 w-4 text-primary mx-auto" /> 
    : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
);

export const CompetitionSlide = () => (
  <PitchDeckSlide className="p-6 md:p-10">
    <div className="space-y-5">
      <div>
        <p className="text-primary font-semibold mb-1 text-sm">COMPETITIVE LANDSCAPE</p>
        <h2 className="text-2xl md:text-3xl font-bold">
          The Only Complete Investor Platform
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Feature Comparison Table */}
        <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto">
          <h4 className="font-bold text-xs mb-3 text-muted-foreground">FEATURE COMPARISON</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium">Platform</th>
                <th className="text-center py-2 px-1">List</th>
                <th className="text-center py-2 px-1">Value</th>
                <th className="text-center py-2 px-1">AI</th>
                <th className="text-center py-2 px-1">Mort</th>
                <th className="text-center py-2 px-1">Edu</th>
                <th className="text-center py-2 px-1">ROI</th>
                <th className="text-center py-2 px-1">Comm</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp, i) => (
                <tr 
                  key={i} 
                  className={`border-b border-border/50 ${comp.name === "Dubai Wealth Hub" ? "bg-primary/10" : ""}`}
                >
                  <td className={`py-2 px-2 ${comp.name === "Dubai Wealth Hub" ? "text-primary font-bold" : "font-medium"}`}>
                    <div>{comp.name}</div>
                    <div className="text-[10px] text-muted-foreground">{comp.parent}</div>
                  </td>
                  <td className="py-2 px-1"><FeatureIcon has={comp.listings} /></td>
                  <td className="py-2 px-1"><FeatureIcon has={comp.valuation} /></td>
                  <td className="py-2 px-1"><FeatureIcon has={comp.aiSearch} /></td>
                  <td className="py-2 px-1"><FeatureIcon has={comp.mortgageTools} /></td>
                  <td className="py-2 px-1"><FeatureIcon has={comp.investorEd} /></td>
                  <td className="py-2 px-1"><FeatureIcon has={comp.roiTools} /></td>
                  <td className="py-2 px-1"><FeatureIcon has={comp.community} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Radar Chart */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-bold text-xs mb-2 text-muted-foreground">CAPABILITY COMPARISON</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="feature" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Radar name="Bayut" dataKey="bayut" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} strokeWidth={1} />
                <Radar name="PropertyFinder" dataKey="pf" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.05} strokeWidth={1} strokeDasharray="3 3" />
                <Radar name="Dubai Wealth Hub" dataKey="dwh" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px] mt-2">
            <div className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-primary text-primary" />
              <span>Dubai Wealth Hub</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="h-2 w-2 fill-muted-foreground text-muted-foreground" />
              <span>Competitors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Positioning Matrix + Moats */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Positioning Matrix */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-bold text-xs mb-2 text-muted-foreground">MARKET POSITIONING</h4>
          <div className="h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  domain={[0, 100]} 
                  tick={{ fontSize: 9 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  label={{ value: 'Investment Focus →', position: 'bottom', fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  domain={[0, 100]} 
                  tick={{ fontSize: 9 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  label={{ value: 'Platform Depth →', angle: -90, position: 'left', fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                />
                <ZAxis type="number" dataKey="z" range={[100, 400]} />
                <Tooltip 
                  content={({ payload }) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded px-2 py-1 text-xs">
                          {data.name}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={positioningData}>
                  {positioningData.map((entry, index) => (
                    <Cell key={index} fill={entry.name === 'Dubai Wealth Hub' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Labels */}
            <div className="absolute top-2 left-6 text-[9px] text-muted-foreground">Property Search</div>
            <div className="absolute top-2 right-2 text-[9px] text-primary font-medium">Wealth Building</div>
          </div>
        </div>

        {/* Competitive Moats */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-muted-foreground">COMPETITIVE MOATS</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-border rounded-lg p-3">
              <p className="font-bold text-xs text-primary">Vertical Integration</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Only platform combining listings + education + tools + community
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-transparent border border-border rounded-lg p-3">
              <p className="font-bold text-xs text-accent">Investor-First</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Competitors optimize for agents; we optimize for investors
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-border rounded-lg p-3">
              <p className="font-bold text-xs text-primary">HNWI Concierge</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                White-glove service not offered by transaction-focused platforms
              </p>
            </div>
            <div className="bg-gradient-to-br from-accent/10 to-transparent border border-border rounded-lg p-3">
              <p className="font-bold text-xs text-accent">Cross-Border Intel</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Dubai ↔ International investor corridor focus
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
