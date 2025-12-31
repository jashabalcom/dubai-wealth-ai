import { PitchDeckSlide } from "../PitchDeckSlide";
import { Users, Briefcase, GraduationCap } from "lucide-react";

export const TeamSlide = () => (
  <PitchDeckSlide className="p-12">
    <div className="space-y-8">
      <div>
        <p className="text-primary font-semibold mb-2">THE TEAM</p>
        <h2 className="text-4xl md:text-5xl font-bold">
          Built by Industry Experts
        </h2>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h3 className="font-bold text-lg">Founder / CEO</h3>
          <p className="text-primary text-sm mb-3">[Your Name]</p>
          <p className="text-sm text-muted-foreground">
            [Years] experience in Dubai real estate. Previously [role] at [company].
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            <Briefcase className="h-10 w-10 text-white" />
          </div>
          <h3 className="font-bold text-lg">CTO</h3>
          <p className="text-accent text-sm mb-3">[Tech Lead Name]</p>
          <p className="text-sm text-muted-foreground">
            Full-stack engineer. Built [notable projects]. [University] CS graduate.
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h3 className="font-bold text-lg">Head of Content</h3>
          <p className="text-primary text-sm mb-3">[Content Lead Name]</p>
          <p className="text-sm text-muted-foreground">
            Former [media company]. Expert in Dubai property investment education.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-xl p-8">
        <h3 className="text-xl font-bold mb-6">Advisory Board</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium">[Advisor 1]</p>
            <p className="text-xs text-muted-foreground">Dubai Developer</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium">[Advisor 2]</p>
            <p className="text-xs text-muted-foreground">PropTech Founder</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium">[Advisor 3]</p>
            <p className="text-xs text-muted-foreground">VC Partner</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium">[Advisor 4]</p>
            <p className="text-xs text-muted-foreground">Legal Expert</p>
          </div>
        </div>
      </div>
    </div>
  </PitchDeckSlide>
);
