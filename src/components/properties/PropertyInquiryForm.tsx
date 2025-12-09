import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const inquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  message: z.string().optional(),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

interface PropertyInquiryFormProps {
  propertyTitle: string;
  propertyId: string;
}

export function PropertyInquiryForm({ propertyTitle, propertyId }: PropertyInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inquiryType, setInquiryType] = useState<'viewing' | 'enquiry'>('enquiry');
  const { user, profile } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: profile?.full_name || '',
      email: profile?.email || user?.email || '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('property-inquiry', {
        body: {
          propertyId,
          propertyTitle,
          inquiryType,
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
        }
      });

      if (error) throw error;

      console.log('Inquiry submitted:', response);
      
      setIsSubmitted(true);
      
      toast({
        title: inquiryType === 'viewing' ? 'Viewing Requested' : 'Enquiry Sent',
        description: response?.routed_to === 'agent' 
          ? "The listing agent will contact you shortly."
          : "Our team will review and connect you with the right agent.",
      });
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        reset();
      }, 3000);
    } catch (error) {
      console.error('Inquiry error:', error);
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h2 className="font-heading text-xl text-foreground mb-4">Interested in this property?</h2>
      
      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={inquiryType === 'viewing' ? 'gold' : 'outline'}
          size="sm"
          onClick={() => setInquiryType('viewing')}
          className="flex-1"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Viewing
        </Button>
        <Button
          variant={inquiryType === 'enquiry' ? 'gold' : 'outline'}
          size="sm"
          onClick={() => setInquiryType('enquiry')}
          className="flex-1"
        >
          <Mail className="w-4 h-4 mr-2" />
          Enquire
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-heading text-xl text-foreground mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground">
              We'll get back to you within 24 hours.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+971 50 123 4567"
                {...register('phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder={
                  inquiryType === 'viewing' 
                    ? "Preferred dates and times..." 
                    : "Any specific questions about the property..."
                }
                rows={3}
                {...register('message')}
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : inquiryType === 'viewing' ? (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Request Viewing
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Enquiry
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By submitting, you agree to be contacted by a licensed RERA-registered agent regarding this property.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
