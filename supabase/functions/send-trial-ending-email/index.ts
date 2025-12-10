import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from 'npm:react@18.3.1'
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrialEndingRequest {
  email: string
  name: string
  tier: 'investor' | 'elite'
  daysRemaining: number
  trialEndDate: string
  siteUrl?: string
}

const styles = {
  main: { backgroundColor: '#0A0F1D', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  container: { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' },
  header: { textAlign: 'center' as const, paddingBottom: '32px', borderBottom: '1px solid rgba(203, 184, 158, 0.2)' },
  urgencyBanner: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '12px 20px', marginBottom: '24px', textAlign: 'center' as const, border: '1px solid rgba(239, 68, 68, 0.3)' },
  urgencyText: { color: '#FCA5A5', fontSize: '16px', fontWeight: '600', margin: '0' },
  heading: { color: '#FFFFFF', fontSize: '28px', fontWeight: '700', textAlign: 'center' as const, margin: '0 0 24px 0' },
  paragraph: { color: '#EAE8E3', fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px 0' },
  featuresList: { backgroundColor: '#101010', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', border: '1px solid rgba(203, 184, 158, 0.15)' },
  featureItem: { color: '#EAE8E3', fontSize: '15px', margin: '0 0 10px 0', opacity: '0.9' },
  ctaSection: { textAlign: 'center' as const, margin: '32px 0' },
  priceText: { color: '#EAE8E3', fontSize: '18px', margin: '0 0 20px 0' },
  button: { backgroundColor: '#CBB89E', color: '#0A0F1D', padding: '14px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', textDecoration: 'none', display: 'inline-block' },
  reassurance: { backgroundColor: 'rgba(203, 184, 158, 0.08)', borderRadius: '8px', padding: '16px 20px', marginTop: '24px' },
  reassuranceText: { color: '#898989', fontSize: '13px', lineHeight: '1.6', margin: '0', textAlign: 'center' as const },
  signoff: { color: '#898989', fontSize: '14px', textAlign: 'center' as const, margin: '32px 0 0 0', lineHeight: '1.8' },
  footer: { paddingTop: '32px' },
  divider: { borderColor: 'rgba(203, 184, 158, 0.2)', margin: '0 0 24px 0' },
  footerText: { color: '#898989', fontSize: '12px', textAlign: 'center' as const, margin: '0 0 16px 0' },
  footerLink: { color: '#898989', fontSize: '12px', textDecoration: 'underline' },
  copyright: { color: '#666666', fontSize: '11px', textAlign: 'center' as const, margin: '0' },
}

const TrialEndingEmail = ({ name, tier, daysRemaining, trialEndDate, siteUrl }: { name: string, tier: string, daysRemaining: number, trialEndDate: string, siteUrl: string }) => {
  const isElite = tier === 'elite'
  const tierName = isElite ? 'Dubai Elite' : 'Dubai Investor'
  const price = isElite ? '$97' : '$29'
  
  return (
    <Html>
      <Head />
      <Preview>Your {tierName} trial ends in {daysRemaining} days</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={{ color: '#CBB89E', fontSize: '24px', fontWeight: '700', margin: '0' }}>Dubai Wealth Hub</Text>
          </Section>
          
          <Section style={styles.urgencyBanner}>
            <Text style={styles.urgencyText}>⏰ {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</Text>
          </Section>
          
          <Heading style={styles.heading}>{name}, your trial is ending soon</Heading>
          
          <Text style={styles.paragraph}>
            Your {tierName} membership trial ends on <strong>{trialEndDate}</strong>. After this date, you'll lose access to:
          </Text>
          
          <Section style={styles.featuresList}>
            <Text style={styles.featureItem}>❌ Academy courses & lessons</Text>
            <Text style={styles.featureItem}>❌ Investment calculators & AI analysis</Text>
            <Text style={styles.featureItem}>❌ Property search & saved favorites</Text>
            <Text style={styles.featureItem}>❌ Community access & connections</Text>
            {isElite && (
              <>
                <Text style={styles.featureItem}>❌ Golden Visa Wizard</Text>
                <Text style={styles.featureItem}>❌ AI Investment Blueprint</Text>
                <Text style={styles.featureItem}>❌ Portfolio tracking dashboard</Text>
              </>
            )}
          </Section>
          
          <Section style={styles.ctaSection}>
            <Text style={styles.priceText}>Continue for just <span style={{ color: '#CBB89E', fontWeight: '700' }}>{price}/month</span></Text>
            <Button href={`${siteUrl}/settings`} style={styles.button}>Keep My Access →</Button>
          </Section>
          
          <Section style={styles.reassurance}>
            <Text style={styles.reassuranceText}>
              Your card will be charged automatically on {trialEndDate} unless you cancel.<br /><br />
              🔒 Cancel anytime from your account settings. No questions asked.
            </Text>
          </Section>
          
          <Text style={styles.signoff}>
            Questions about your subscription? Reply to this email or contact <strong>support@dubaiwealthhub.com</strong>
          </Text>
          
          <Section style={styles.footer}>
            <Hr style={styles.divider} />
            <Text style={styles.footerText}>
              <Link href="mailto:support@dubaiwealthhub.com" style={styles.footerLink}>support@dubaiwealthhub.com</Link>
            </Text>
            <Text style={styles.copyright}>© {new Date().getFullYear()} Dubai Wealth Hub. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, tier, daysRemaining, trialEndDate, siteUrl = 'https://dubaiwealthhub.com' }: TrialEndingRequest = await req.json();
    
    console.log(`[TRIAL-ENDING-EMAIL] Sending to ${email}, ${daysRemaining} days remaining`);

    const html = await renderAsync(React.createElement(TrialEndingEmail, { name, tier, daysRemaining, trialEndDate, siteUrl }))

    const subject = daysRemaining <= 1 
      ? `${name}, your trial ends tomorrow! Don't lose access`
      : `${name}, ${daysRemaining} days left in your trial`

    const { data, error } = await resend.emails.send({
      from: "Dubai Wealth Hub <billing@dubaiwealthhub.com>",
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("[TRIAL-ENDING-EMAIL] Error:", error);
      throw error;
    }

    console.log("[TRIAL-ENDING-EMAIL] Sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[TRIAL-ENDING-EMAIL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
