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

interface GettingStartedRequest {
  email: string
  name: string
  tier: 'investor' | 'elite'
  siteUrl?: string
}

// Email styles
const styles = {
  main: { backgroundColor: '#0A0F1D', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  container: { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' },
  header: { textAlign: 'center' as const, paddingBottom: '32px', borderBottom: '1px solid rgba(203, 184, 158, 0.2)' },
  heading: { color: '#FFFFFF', fontSize: '28px', fontWeight: '700', textAlign: 'center' as const, margin: '24px 0' },
  paragraph: { color: '#EAE8E3', fontSize: '16px', lineHeight: '1.6', margin: '0 0 24px 0' },
  subheading: { color: '#CBB89E', fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' },
  card: { backgroundColor: '#101010', borderRadius: '12px', padding: '24px', marginBottom: '16px', border: '1px solid rgba(203, 184, 158, 0.15)' },
  cardIcon: { fontSize: '32px', margin: '0 0 12px 0' },
  cardTitle: { color: '#FFFFFF', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' },
  cardDesc: { color: '#EAE8E3', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px 0', opacity: '0.8' },
  button: { backgroundColor: '#CBB89E', color: '#0A0F1D', padding: '14px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', textDecoration: 'none', display: 'inline-block' },
  eliteSection: { backgroundColor: 'rgba(203, 184, 158, 0.1)', borderRadius: '12px', padding: '24px', marginTop: '24px', border: '1px solid rgba(203, 184, 158, 0.3)' },
  eliteHeading: { color: '#CBB89E', fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' },
  eliteText: { color: '#EAE8E3', fontSize: '14px', margin: '0 0 12px 0' },
  eliteList: { color: '#EAE8E3', fontSize: '14px', lineHeight: '2', margin: '0' },
  ctaSection: { textAlign: 'center' as const, margin: '32px 0' },
  signoff: { color: '#EAE8E3', fontSize: '14px', textAlign: 'center' as const, margin: '32px 0 0 0', lineHeight: '1.8' },
  footer: { paddingTop: '32px' },
  divider: { borderColor: 'rgba(203, 184, 158, 0.2)', margin: '0 0 24px 0' },
  footerText: { color: '#898989', fontSize: '12px', textAlign: 'center' as const, margin: '0 0 16px 0' },
  footerLink: { color: '#898989', fontSize: '12px', textDecoration: 'underline' },
  copyright: { color: '#666666', fontSize: '11px', textAlign: 'center' as const, margin: '0' },
}

const GettingStartedEmail = ({ name, tier, siteUrl }: { name: string, tier: string, siteUrl: string }) => {
  const isElite = tier === 'elite'
  
  return (
    <Html>
      <Head />
      <Preview>Welcome to Dubai Wealth Hub! Your getting started guide</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={{ color: '#CBB89E', fontSize: '24px', fontWeight: '700', margin: '0' }}>Dubai Wealth Hub</Text>
          </Section>
          
          <Heading style={styles.heading}>Welcome, {name}! 🎉</Heading>
          
          <Text style={styles.paragraph}>
            You've just joined an exclusive community of smart investors building wealth through Dubai real estate.
            {isElite ? " As an Elite member, you have access to our most powerful tools and insights." : ""}
          </Text>
          
          <Text style={styles.subheading}>Here are 3 things to do in your first 10 minutes:</Text>
          
          <Section style={styles.card}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardTitle}>1. Complete Your Investor Profile</Text>
            <Text style={styles.cardDesc}>Tell us about your investment goals, budget, and timeline. This helps us personalize your experience.</Text>
            <Button href={`${siteUrl}/profile`} style={styles.button}>Complete Profile →</Button>
          </Section>
          
          <Section style={styles.card}>
            <Text style={styles.cardIcon}>🧮</Text>
            <Text style={styles.cardTitle}>2. Try the ROI Calculator</Text>
            <Text style={styles.cardDesc}>Run the numbers on any Dubai property. See projected returns and cash flow analysis.</Text>
            <Button href={`${siteUrl}/tools/roi`} style={styles.button}>Calculate ROI →</Button>
          </Section>
          
          <Section style={styles.card}>
            <Text style={styles.cardIcon}>🏠</Text>
            <Text style={styles.cardTitle}>3. Browse Properties in Your Budget</Text>
            <Text style={styles.cardDesc}>Explore curated listings across Dubai's top investment areas.</Text>
            <Button href={`${siteUrl}/properties`} style={styles.button}>Browse Properties →</Button>
          </Section>
          
          {isElite && (
            <Section style={styles.eliteSection}>
              <Text style={styles.eliteHeading}>🌟 Your Elite Features</Text>
              <Text style={styles.eliteText}>Don't forget to explore your exclusive Elite tools:</Text>
              <Text style={styles.eliteList}>
                • <strong>Golden Visa Wizard</strong> - AI-powered visa guidance<br />
                • <strong>AI Investment Blueprint</strong> - Personalized strategy<br />
                • <strong>Portfolio Dashboard</strong> - Track your investments<br />
                • <strong>Elite Deal Room</strong> - Exclusive community access
              </Text>
            </Section>
          )}
          
          <Section style={styles.ctaSection}>
            <Button href={`${siteUrl}/dashboard`} style={styles.button}>Go to Dashboard →</Button>
          </Section>
          
          <Text style={styles.signoff}>
            Happy investing!<br /><strong>The Dubai Wealth Hub Team</strong>
          </Text>
          
          <Section style={styles.footer}>
            <Hr style={styles.divider} />
            <Text style={styles.footerText}>
              Questions? Contact <Link href="mailto:support@dubaiwealthhub.com" style={styles.footerLink}>support@dubaiwealthhub.com</Link>
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
    const { email, name, tier, siteUrl = 'https://dubaiwealthhub.com' }: GettingStartedRequest = await req.json();
    
    console.log(`[GETTING-STARTED-EMAIL] Sending to ${email}`);

    const html = await renderAsync(React.createElement(GettingStartedEmail, { name, tier, siteUrl }))

    const { data, error } = await resend.emails.send({
      from: "Dubai Wealth Hub <welcome@dubaiwealthhub.com>",
      to: [email],
      subject: `Welcome to Dubai Wealth Hub, ${name}! Here's how to get started`,
      html,
    });

    if (error) {
      console.error("[GETTING-STARTED-EMAIL] Error:", error);
      throw error;
    }

    console.log("[GETTING-STARTED-EMAIL] Sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[GETTING-STARTED-EMAIL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
