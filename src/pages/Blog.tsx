import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Blog | Dubai Wealth Hub</title>
        <meta name="description" content="Stay updated with the latest Dubai real estate news, market insights, and investment strategies from Dubai Wealth Hub." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Blog & Insights
              </h1>
              <p className="text-muted-foreground text-lg">
                Market analysis, investment strategies, and the latest from Dubai real estate.
              </p>
            </div>

            {/* Content Hub Cards */}
            <div className="space-y-6">
              {/* Community News */}
              <Link 
                to="/community/news" 
                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Newspaper className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Market News
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Stay updated with the latest Dubai real estate news, transaction data, regulatory changes, 
                      and market developments curated for investors.
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary text-sm font-medium">
                      Browse news <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Community Discussions */}
              <Link 
                to="/community" 
                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Community Discussions
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Join conversations with fellow investors, share experiences, ask questions, 
                      and learn from the collective wisdom of our community.
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary text-sm font-medium">
                      Join discussions <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Events */}
              <Link 
                to="/community/events" 
                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Events & Webinars
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Attend live webinars, Q&A sessions, and exclusive events with industry experts, 
                      developers, and successful investors.
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary text-sm font-medium">
                      View events <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Coming Soon */}
            <div className="mt-12 p-6 bg-accent/30 border border-border rounded-xl text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                More Content Coming Soon
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                We're working on in-depth guides, market reports, and exclusive investment insights. 
                Join as a member to be the first to access new content.
              </p>
              <Button asChild>
                <Link to="/pricing">
                  View Membership Options
                </Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
