import { PitchDeckSlide } from "../PitchDeckSlide";

const projections = [
  { year: "Year 1", mrr: "$25K", arr: "$300K", users: "500", notes: "Product-market fit" },
  { year: "Year 2", mrr: "$100K", arr: "$1.2M", users: "2,000", notes: "Scale acquisition" },
  { year: "Year 3", mrr: "$350K", arr: "$4.2M", users: "7,000", notes: "Market leadership" },
  { year: "Year 4", mrr: "$750K", arr: "$9M", users: "15,000", notes: "Regional expansion" },
  { year: "Year 5", mrr: "$1.5M", arr: "$18M", users: "30,000", notes: "Profitability" }
];

export const FinancialsSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">FINANCIAL PROJECTIONS</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          5-Year Growth Model
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4 font-semibold"></th>
              <th className="text-right py-4 px-4 font-semibold">MRR</th>
              <th className="text-right py-4 px-4 font-semibold">ARR</th>
              <th className="text-right py-4 px-4 font-semibold">Paid Users</th>
              <th className="text-left py-4 px-4 font-semibold">Milestone</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((row, i) => (
              <tr key={i} className="border-b border-border hover:bg-muted/50">
                <td className="py-4 px-4 font-medium">{row.year}</td>
                <td className="text-right py-4 px-4 text-primary font-bold">{row.mrr}</td>
                <td className="text-right py-4 px-4 text-accent font-bold">{row.arr}</td>
                <td className="text-right py-4 px-4">{row.users}</td>
                <td className="py-4 px-4 text-muted-foreground text-sm">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-primary">60x</p>
          <p className="text-muted-foreground">ARR Growth (5yr)</p>
        </div>
        <div className="bg-gradient-to-br from-accent/10 to-transparent rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-accent">85%</p>
          <p className="text-muted-foreground">Target Gross Margin</p>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-primary">Year 5</p>
          <p className="text-muted-foreground">Profitability Target</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-6">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Assumptions:</span> 15% MoM growth Year 1-2, 10% MoM Year 3+, 5% monthly churn, $55 blended ARPU, 85% gross margin
        </p>
      </div>
    </div>
  </PitchDeckSlide>
);
