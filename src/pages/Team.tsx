import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Globe, TrendingUp, Trophy, Building2, Linkedin, Mail, 
  Briefcase, GraduationCap, MapPin, Calendar, ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import jashaPhoto from "@/assets/jasha-balcom.jpg";
const careerTimeline = [
  {
    year: "2024",
    title: "Founded Dubai Wealth Hub",
    description: "Launched the intelligence platform for global real estate investors",
    icon: Building2,
    current: true
  },
  {
    year: "2018",
    title: "Global Real Estate Advisor",
    description: "Sotheby's International Realty - Dubai, Miami, Atlanta markets",
    icon: Globe,
    current: false
  },
  {
    year: "2010",
    title: "Real Estate Investment",
    description: "Transitioned to luxury residential and commercial real estate",
    icon: TrendingUp,
    current: false
  },
  {
    year: "2005",
    title: "Wall Street",
    description: "Stock broker - Developed financial markets expertise",
    icon: Briefcase,
    current: false
  },
  {
    year: "2002",
    title: "Professional Baseball",
    description: "Chicago Cubs organization - Elite performance training",
    icon: Trophy,
    current: false
  }
];

const expertise = [
  {
    title: "Global Real Estate",
    description: "Deep expertise in Dubai, Miami, and Atlanta luxury markets with a focus on international investor needs",
    icon: Globe
  },
  {
    title: "HNWI Advisory",
    description: "Extensive network of high-net-worth individuals and elite performers seeking sovereign capital placement",
    icon: TrendingUp
  },
  {
    title: "Financial Markets",
    description: "Background in securities and investment analysis brings institutional rigor to real estate decisions",
    icon: Briefcase
  },
  {
    title: "Performance Mindset",
    description: "Elite athletic discipline translates to relentless execution, coachability, and resilience under pressure",
    icon: Trophy
  }
];

export default function Team() {
  return (
    <>
      <SEOHead 
        title="Team | Dubai Wealth Hub"
        description="Meet the team behind Dubai Wealth Hub. Founded by Jasha Balcom, a global real estate advisor with 22+ years of experience in finance and luxury real estate."
      />
      <Navbar />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-primary font-semibold mb-4">OUR TEAM</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Built by Industry Experts
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dubai Wealth Hub was founded to democratize the same institutional-grade 
                intelligence that top advisors provide to their HNWI clients.
              </p>
            </div>
          </div>
        </section>

        {/* Founder Profile */}
        <section className="py-16 bg-card">
          <div className="container">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
                {/* Photo & Quick Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="aspect-square max-w-sm mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src={jashaPhoto} 
                      alt="Jasha Balcom - Founder & CEO of Dubai Wealth Hub"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="text-center lg:text-left space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">Jasha Balcom</h2>
                      <p className="text-primary font-semibold">Founder & CEO</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Dubai • Miami • Atlanta
                      </span>
                      <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        22+ Years Experience
                      </span>
                    </div>
                    
                    <div className="flex justify-center lg:justify-start gap-3">
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href="https://www.linkedin.com/in/jashabalcom" target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </a>
                      </Button>
                      <Button size="sm" className="gap-2" asChild>
                        <a href="mailto:jasha@dubaiwealth.com">
                          <Mail className="h-4 w-4" />
                          Contact
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Bio & Story */}
                <div className="lg:col-span-3 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">The Story</h3>
                    <div className="prose prose-muted max-w-none space-y-4 text-muted-foreground">
                      <p>
                        Jasha Balcom brings a rare combination of elite performance discipline, 
                        financial markets fluency, and global luxury real estate expertise to Dubai Wealth Hub.
                      </p>
                      <p>
                        After a professional baseball career with the Chicago Cubs organization—where he 
                        learned the discipline of elite performance—Jasha transitioned to Wall Street as 
                        a stock broker. This financial markets foundation gave him the analytical rigor 
                        that would later differentiate his approach to real estate investment.
                      </p>
                      <p>
                        Today, as a Global Real Estate Advisor with Sotheby's International Realty, 
                        Jasha specializes in sovereign capital placement for HNWIs and elite performers 
                        across Dubai, Miami, and Atlanta. He built Dubai Wealth Hub to democratize the 
                        same intelligence and tools he provides to his private clients—leveling the 
                        playing field for all international investors.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-4">Expertise</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {expertise.map((item) => (
                        <Card key={item.title} className="bg-background">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <item.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{item.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Career Timeline */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-8 text-center">Career Timeline</h3>
              
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-8">
                  {careerTimeline.map((item, index) => (
                    <div key={index} className="relative flex gap-6">
                      <div className={`
                        w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 z-10
                        ${item.current 
                          ? 'bg-gradient-to-br from-primary to-accent text-white' 
                          : 'bg-card border border-border text-muted-foreground'
                        }
                      `}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      
                      <div className="pt-3">
                        <p className="text-xs text-primary font-semibold">{item.year}</p>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Join the Team CTA */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">Join the Team</h3>
              <p className="text-muted-foreground mb-6">
                We're building the future of real estate intelligence. If you're passionate about 
                PropTech, real estate, or helping investors make better decisions, we'd love to hear from you.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                <Card className="bg-card/50 border-dashed">
                  <CardContent className="p-4 text-center">
                    <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-sm">CTO / Technical Co-Founder</p>
                    <p className="text-xs text-muted-foreground">Actively seeking</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-dashed">
                  <CardContent className="p-4 text-center">
                    <Briefcase className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-sm">Strategic Advisors</p>
                    <p className="text-xs text-muted-foreground">Building advisory board</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <a href="mailto:jasha@dubaiwealth.com" className="gap-2">
                    Get in Touch
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/investors">
                    View Pitch Deck
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
