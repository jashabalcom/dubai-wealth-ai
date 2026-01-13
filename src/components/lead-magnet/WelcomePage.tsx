import { User } from 'lucide-react';

interface WelcomePageProps {
  authorName?: string;
  authorTitle?: string;
  authorBio?: string;
  authorPhotoUrl?: string;
}

export function WelcomePage({
  authorName = "Your Name",
  authorTitle = "Founder, Dubai Real Estate Investors",
  authorBio = "Add your personal story and credentials here. Share your experience in Dubai real estate and why you created this guide to help investors succeed.",
  authorPhotoUrl
}: WelcomePageProps) {
  return (
    <div className="w-[816px] h-[1056px] bg-pearl relative overflow-hidden flex flex-col">
      {/* Gold accent line top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/50" />
      
      {/* Content */}
      <div className="flex-1 px-16 py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-px bg-primary" />
          <span className="text-primary font-medium text-sm tracking-wider uppercase">Welcome</span>
        </div>
        
        <h2 className="font-serif text-4xl text-secondary mb-8">
          A Personal Note from the Author
        </h2>
        
        <div className="flex gap-12">
          {/* Main content */}
          <div className="flex-1">
            <div className="prose prose-lg text-secondary/80 leading-relaxed space-y-4">
              <p>
                Dear Future Dubai Property Investor,
              </p>
              <p>
                Thank you for downloading this guide. If you're reading this, you've likely been considering 
                investing in Dubai real estate — one of the most exciting and rewarding markets in the world.
              </p>
              <p>
                Over the years, I've helped countless investors navigate the opportunities and challenges 
                of this dynamic market. This guide distills the essential knowledge you need to make 
                informed decisions and avoid costly mistakes.
              </p>
              <p>
                Whether you're looking for rental yields, capital appreciation, or a path to residency 
                through the Golden Visa program, the insights in this guide will give you a solid foundation.
              </p>
              <p className="font-medium text-secondary">
                To your success,
              </p>
            </div>
            
            {/* Signature area */}
            <div className="mt-8 pt-6 border-t border-secondary/10">
              <p className="font-serif text-2xl text-secondary">{authorName}</p>
              <p className="text-primary text-sm mt-1">{authorTitle}</p>
            </div>
          </div>
          
          {/* Author photo and bio sidebar */}
          <div className="w-64">
            <div className="bg-secondary rounded-2xl p-6 text-center">
              {/* Photo placeholder */}
              <div className="w-32 h-32 mx-auto rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center mb-4 overflow-hidden">
                {authorPhotoUrl ? (
                  <img src={authorPhotoUrl} alt={authorName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-primary/60" />
                )}
              </div>
              <h3 className="font-serif text-lg text-pearl mb-1">{authorName}</h3>
              <p className="text-primary text-xs mb-4">{authorTitle}</p>
              <p className="text-pearl/70 text-xs leading-relaxed">
                {authorBio}
              </p>
            </div>
          </div>
        </div>
        
        {/* Who this guide is for section */}
        <div className="mt-12 bg-secondary/5 rounded-xl p-8">
          <h3 className="font-serif text-xl text-secondary mb-4">Who This Guide Is For</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              "First-time international investors exploring Dubai",
              "Experienced investors diversifying their portfolio",
              "Expats considering property for residency purposes",
              "Anyone seeking passive income through rentals"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-secondary text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-secondary/80 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-16 py-4 border-t border-secondary/10 flex justify-between items-center">
        <span className="text-secondary/40 text-xs">Dubai Real Estate Investors</span>
        <span className="text-secondary/40 text-xs">Page 2</span>
      </div>
    </div>
  );
}
