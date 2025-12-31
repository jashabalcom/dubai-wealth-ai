import { PitchDeckSlide } from "../PitchDeckSlide";

export const MarketSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">MARKET OPPORTUNITY</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          Dubai: The World's Hottest Real Estate Market
        </h2>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-5xl font-bold text-primary mb-2">$30B+</p>
          <p className="text-lg font-semibold">TAM</p>
          <p className="text-sm text-muted-foreground">Dubai real estate transactions annually</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-5xl font-bold text-accent mb-2">$9B</p>
          <p className="text-lg font-semibold">SAM</p>
          <p className="text-sm text-muted-foreground">Foreign investor segment (30% of market)</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-5xl font-bold text-primary mb-2">$450M</p>
          <p className="text-lg font-semibold">SOM</p>
          <p className="text-sm text-muted-foreground">Addressable PropTech opportunity</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Market Tailwinds</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">→</span>
              <span>Golden Visa program driving 40% YoY foreign investment growth</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">→</span>
              <span>Dubai Expo 2020 legacy infrastructure and global awareness</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">→</span>
              <span>0% property tax attracting global wealth migration</span>
            </li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-accent/10 to-transparent rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">PropTech Adoption</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">→</span>
              <span>UAE PropTech sector growing at 25% CAGR</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">→</span>
              <span>Digital-first buyers expect online intelligence tools</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">→</span>
              <span>Limited competition in investor-focused vertical SaaS</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
