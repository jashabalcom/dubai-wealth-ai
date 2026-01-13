import { useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Settings, FileText } from 'lucide-react';
import { 
  CoverPage, 
  WelcomePage, 
  SecretPage, 
  CTAPage, 
  PDFExportButton 
} from '@/components/lead-magnet';
import {
  MapPin,
  Search,
  Calculator,
  Award,
  Home,
  TrendingUp,
  ArrowRightLeft
} from 'lucide-react';

// Content for the 7 secrets
const secrets = [
  {
    number: 1,
    title: "The Freehold Advantage",
    subtitle: "Understanding Foreign Ownership in Dubai",
    icon: MapPin,
    content: [
      "Dubai is one of the few places in the Middle East where foreigners can own property outright. However, this right is limited to designated 'freehold' zones. Understanding this distinction is crucial before making any investment.",
      "There are 23 designated freehold areas in Dubai, including popular locations like Dubai Marina, Downtown Dubai, Palm Jumeirah, and Business Bay. Outside these areas, foreigners can only lease property for up to 99 years.",
      "Freehold ownership gives you complete control over your property, including the right to sell, lease, or pass it on to heirs without restrictions. This is particularly valuable for long-term investors and those seeking residency benefits."
    ],
    keyInsight: "Only 23 areas in Dubai allow foreign freehold ownership. Always verify the property is in a freehold zone before investing.",
    actionItems: [
      "Request the title deed to confirm freehold status",
      "Verify the property is registered with Dubai Land Department",
      "Check if the area is designated for foreign ownership"
    ],
    variant: 'light' as const
  },
  {
    number: 2,
    title: "The Due Diligence Framework",
    subtitle: "Developer Evaluation Essentials",
    icon: Search,
    content: [
      "Not all developers are created equal. In Dubai's dynamic market, developer selection can make or break your investment. The right developer delivers on time, on budget, and with quality that holds value over time.",
      "Key factors to evaluate include: track record of completed projects, RERA registration status, financial stability, quality of past handovers, and reputation within the investment community.",
      "Red flags to watch for include: developers with multiple delayed projects, poor reviews from existing buyers, lack of transparent communication, and projects that have been 'relaunched' multiple times."
    ],
    keyInsight: "A developer's track record is the best predictor of future performance. Research their last 5 completed projects before committing.",
    actionItems: [
      "Check the developer's RERA registration number",
      "Visit previously completed projects in person",
      "Join investor forums to gather feedback from existing buyers",
      "Verify the project has all required approvals"
    ],
    variant: 'dark' as const
  },
  {
    number: 3,
    title: "The True Cost of Ownership",
    subtitle: "Beyond the Purchase Price",
    icon: Calculator,
    content: [
      "Many investors focus solely on the property price and overlook the full cost of ownership. Understanding all costs upfront prevents surprises and enables accurate ROI calculations.",
      "Acquisition costs include: 4% DLD transfer fee (Dubai Land Department), 2% agency commission, AED 580 registration trustee fee, AED 4,200 DLD admin fee, and NOC fees from the developer (typically AED 500-5,000).",
      "Ongoing costs include: service charges (AED 12-40 per sq ft annually), DEWA connection, chiller fees for district cooling areas, maintenance reserves, and property management if using rental services.",
      "When selling, expect: 2% agency commission, any mortgage discharge fees, and potential early handover penalties for off-plan properties."
    ],
    keyInsight: "Total acquisition costs typically add 6-8% on top of the purchase price. Factor this into your investment calculations.",
    actionItems: [
      "Request a detailed breakdown of all fees before signing",
      "Calculate 5-year total cost of ownership including service charges",
      "Compare service charges across similar properties in the area"
    ],
    variant: 'light' as const
  },
  {
    number: 4,
    title: "The Golden Visa Pathway",
    subtitle: "Residency Through Real Estate Investment",
    icon: Award,
    content: [
      "The UAE Golden Visa is one of the most attractive residency programs in the world. For real estate investors, it offers a 10-year renewable visa through property investment.",
      "To qualify, you need to own property worth at least AED 2 million. This can be one property or multiple properties totaling the threshold. Off-plan properties may qualify if at least 50% has been paid.",
      "Benefits include: 10-year residency for you and your family, no sponsor required, ability to stay outside UAE for extended periods without losing visa status, and inclusion of spouse and children."
    ],
    keyInsight: "The AED 2 million threshold applies to your equity in the property, not just the purchase price. Mortgaged portions typically don't count toward the requirement.",
    actionItems: [
      "Confirm your investment meets the AED 2 million threshold",
      "Gather required documents: title deed, passport copies, photos",
      "Apply through ICP or GDRFA within 6 months of purchase",
      "Consider bundling multiple properties if needed to meet threshold"
    ],
    variant: 'dark' as const
  },
  {
    number: 5,
    title: "Rental Yield Secrets",
    subtitle: "Maximizing Your Returns",
    icon: Home,
    content: [
      "Dubai offers some of the highest rental yields in the world for prime real estate, ranging from 5% to 10% depending on location and property type. Understanding how to maximize yields is essential for cash flow investors.",
      "Long-term rentals provide stable, predictable income with minimal management overhead. Average yields range from 5-7% in premium areas. Short-term holiday home rentals can yield 8-12% but require more active management and proper licensing.",
      "Top-yielding areas in 2024-2025 include: JVC (7-9%), Dubai Sports City (7-8%), International City (8-10%), and Discovery Gardens (7-8%). Premium areas like Dubai Marina and Downtown offer lower yields (5-6%) but stronger capital appreciation."
    ],
    keyInsight: "Higher yields often come with trade-offs: lower capital appreciation, more management, or less desirable locations. Balance yield with growth potential.",
    actionItems: [
      "Research average rents for your target area and property type",
      "Factor in 10-15% vacancy allowance for realistic projections",
      "Consider property management costs (typically 5-8% of rent)",
      "Obtain holiday home license if pursuing short-term rentals"
    ],
    variant: 'light' as const
  },
  {
    number: 6,
    title: "Off-Plan vs Ready Properties",
    subtitle: "Strategic Timing Decisions",
    icon: TrendingUp,
    content: [
      "One of the biggest decisions investors face is whether to buy off-plan (under construction) or ready (completed) properties. Each has distinct advantages and risks.",
      "Off-plan advantages: Lower entry prices (often 10-20% below ready prices), flexible payment plans spread over construction, potential for capital appreciation before handover, and first-mover advantage on prime units.",
      "Ready property advantages: Immediate rental income, no construction delays, what you see is what you get, and ability to inspect before purchase. Generally considered lower risk for first-time investors.",
      "Off-plan risks to consider: Developer delays, market changes during construction period, finished quality may differ from showroom, and locked capital during construction."
    ],
    keyInsight: "Off-plan works best when you can afford to wait 2-4 years and have evaluated developer track records. Ready properties suit investors seeking immediate income.",
    actionItems: [
      "Assess your timeline and liquidity needs honestly",
      "For off-plan: verify project timeline and payment schedule",
      "For ready: inspect thoroughly and review service charge history",
      "Consider mixed strategy: ready for income, off-plan for growth"
    ],
    variant: 'dark' as const
  },
  {
    number: 7,
    title: "The Exit Strategy",
    subtitle: "Planning Your Way Out",
    icon: ArrowRightLeft,
    content: [
      "Smart investors think about their exit before they buy. Whether you're holding for the long term or planning to flip, having a clear exit strategy shapes your investment decisions.",
      "Exit options include: Selling on the secondary market, refinancing to extract equity, holding for rental income, or passing to heirs. Each has different tax implications and timing considerations.",
      "Timing your exit matters: Market cycles in Dubai typically run 7-10 years. Understanding where we are in the cycle helps you plan optimal exit windows. Expo 2020 and post-pandemic recovery have created unique conditions worth monitoring.",
      "Flipping considerations: Off-plan flipping is popular but be aware of Oqood (pre-registration) fees, developer restrictions on resale before handover, and market timing risks."
    ],
    keyInsight: "No capital gains tax in UAE is a major advantage, but factor in transaction costs (typically 6-8%) when calculating actual returns on quick flips.",
    actionItems: [
      "Define your investment horizon before purchasing",
      "Understand any resale restrictions from the developer",
      "Monitor market indicators for optimal exit timing",
      "Keep records of all costs for accurate profit calculation"
    ],
    variant: 'light' as const
  }
];

export default function LeadMagnetBuilder() {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('preview');
  
  // Author customization state
  const [authorName, setAuthorName] = useState("Your Name");
  const [authorTitle, setAuthorTitle] = useState("Founder, Dubai Real Estate Investors");
  const [authorBio, setAuthorBio] = useState(
    "Add your personal story and credentials here. Share your experience in Dubai real estate and why you created this guide to help investors succeed."
  );
  const [authorPhotoUrl, setAuthorPhotoUrl] = useState("");

  const totalPages = 2 + secrets.length + 1; // Cover + Welcome + Secrets + CTA

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Lead Magnet Builder</h1>
              <p className="text-sm text-muted-foreground">Dubai Investment Secrets PDF Guide</p>
            </div>
          </div>
          <PDFExportButton 
            containerRef={pdfContainerRef} 
            pageCount={totalPages}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Author Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Customize Author Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Author Name</label>
                  <Input 
                    value={authorName} 
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input 
                    value={authorTitle} 
                    onChange={(e) => setAuthorTitle(e.target.value)}
                    placeholder="Your title or role"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Photo URL</label>
                  <Input 
                    value={authorPhotoUrl} 
                    onChange={(e) => setAuthorPhotoUrl(e.target.value)}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a URL to your professional headshot
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <Textarea 
                    value={authorBio} 
                    onChange={(e) => setAuthorBio(e.target.value)}
                    placeholder="Your background and credentials..."
                    rows={4}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('preview')}
                >
                  Preview Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                Scroll to preview all {totalPages} pages. Click "Download PDF" when ready.
              </p>
            </div>
            
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div 
                ref={pdfContainerRef}
                className="flex flex-col items-center gap-8 pb-8"
              >
                {/* Cover Page */}
                <div data-pdf-page="1" className="shadow-2xl">
                  <CoverPage />
                </div>
                
                {/* Welcome Page */}
                <div data-pdf-page="2" className="shadow-2xl">
                  <WelcomePage 
                    authorName={authorName}
                    authorTitle={authorTitle}
                    authorBio={authorBio}
                    authorPhotoUrl={authorPhotoUrl}
                  />
                </div>
                
                {/* Secret Pages */}
                {secrets.map((secret, index) => (
                  <div 
                    key={secret.number} 
                    data-pdf-page={index + 3} 
                    className="shadow-2xl"
                  >
                    <SecretPage
                      secretNumber={secret.number}
                      title={secret.title}
                      subtitle={secret.subtitle}
                      icon={secret.icon}
                      content={secret.content}
                      keyInsight={secret.keyInsight}
                      actionItems={secret.actionItems}
                      pageNumber={index + 3}
                      variant={secret.variant}
                    />
                  </div>
                ))}
                
                {/* CTA Page */}
                <div data-pdf-page={totalPages} className="shadow-2xl">
                  <CTAPage />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
