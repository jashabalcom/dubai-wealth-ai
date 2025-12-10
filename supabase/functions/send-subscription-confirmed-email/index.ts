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

interface SubscriptionConfirmedRequest {
  email: string
  name: string
  tier: 'investor' | 'elite'
  amount: string
  nextBillingDate: string
  siteUrl?: string
}

const styles = {
  main: { backgroundColor: '#0A0F1D', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  container: { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' },
  header: { textAlign: 'center' as const, paddingBottom: '32px', borderBottom: '1px solid rgba(203, 184, 158, 0.2)' },
  successBanner: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'center' as const, border: '1px solid rgba(34, 197, 94, 0.3)' },
  successIcon: { fontSize: '32px', color: '#22C55E', margin: '0 0 8px 0' },
  successText: { color: '#86EFAC', fontSize: '16px', fontWeight: '600', margin: '0' },
  heading: { color: '#FFFFFF', fontSize: '28px', fontWeight: '700', textAlign: 'center' as const, margin: '0 0 16px 0' },
  paragraph: { color: '#EAE8E3', fontSize: '16px', lineHeight: '1.6', textAlign: 'center' as const, margin: '0 0 32px 0' },
  receiptCard: { backgroundColor: '#101010', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(203, 184, 158, 0.15)' },
  receiptTitle: { color: '#FFFFFF', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' },
  receiptDivider: { borderColor: 'rgba(203, 184, 158, 0.15)', margin: '16px 0' },
  receiptLabel: { color: '#898989', fontSize: '14px', margin: '0 0 4px 0' },
  receiptValue: { color: '#FFFFFF', fontSize: '15px', fontWeight: '500', margin: '0 0 12px 0' },
  quickLinksTitle: { color: '#CBB89E', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 16px 0' },
  linkText: { color: '#EAE8E3', fontSize: '15px', margin: '0 0 12px 0' },
  button: { backgroundColor: '#CBB89E', color: '#0A0F1D', padding: '14px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', textDecoration: 'none', display: 'inline-block' },
  ctaSection: { textAlign: 'center' as const, margin: '32px 0' },
  manageText: { color: '#898989', fontSize: '13px', margin: '0', textAlign: 'center' as const },
  footer: { paddingTop: '32px' },
  divider: { borderColor: 'rgba(203, 184, 158, 0.2)', margin: '0 0 24px 0' },
  footerText: { color: '#898989', fontSize: '12px', textAlign: 'center' as const, margin: '0 0 16px 0' },
  footerLink: { color: '#CBB89E', textDecoration: 'underline' },
  copyright: { color: '#666666', fontSize: '11px', textAlign: 'center' as const, margin: '0' },
}

const SubscriptionConfirmedEmail = ({ name, tier, amount, nextBillingDate, siteUrl }: { name: string, tier: string, amount: string, nextBillingDate: string, siteUrl: string }) => {
  const isElite = tier === 'elite'
  const tierName = isElite ? 'Dubai Elite' : 'Dubai Investor'
  
  return (
    <Html>
      <Head />
      <Preview>Your {tierName} subscription is confirmed!</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={{ color: '#CBB89E', fontSize: '24px', fontWeight: '700', margin: '0' }}>Dubai Wealth Hub</Text>
          </Section>
          
          <Section style={styles.successBanner}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>Payment Successful</Text>
          </Section>
          
          <Heading style={styles.heading}>Welcome to {tierName}, {name}!</Heading>
          
          <Text style={styles.paragraph}>
            Thank you for your subscription. You now have full access to all {isElite ? 'Elite' : 'Investor'} features.
          </Text>
          
          <Section style={styles.receiptCard}>
            <Text style={styles.receiptTitle}>Receipt Summary</Text>
            <Hr style={styles.receiptDivider} />
            <Text style={styles.receiptLabel}>Plan</Text>
            <Text style={styles.receiptValue}>{tierName} Membership</Text>
            <Text style={styles.receiptLabel}>Amount</Text>
            <Text style={styles.receiptValue}>{amount}/month</Text>
            <Text style={styles.receiptLabel}>Next billing date</Text>
            <Text style={styles.receiptValue}>{nextBillingDate}</Text>
          </Section>
          
          <Section style={{ marginBottom: '24px' }}>
            <Text style={styles.quickLinksTitle}>Quick Links</Text>
            <Text style={styles.linkText}>📚 <Link href={`${siteUrl}/academy`} style={styles.footerLink}>Browse Academy Courses</Link></Text>
            <Text style={styles.linkText}>🧮 <Link href={`${siteUrl}/tools`} style={styles.footerLink}>Investment Calculators</Link></Text>
            <Text style={styles.linkText}>🏠 <Link href={`${siteUrl}/properties`} style={styles.footerLink}>Browse Properties</Link></Text>
            <Text style={styles.linkText}>💬 <Link href={`${siteUrl}/community`} style={styles.footerLink}>Join the Community</Link></Text>
            {isElite && <Text style={styles.linkText}>🌟 <Link href={`${siteUrl}/golden-visa`} style={styles.footerLink}>Golden Visa Wizard</Link></Text>}
          </Section>
          
          <Section style={styles.ctaSection}>
            <Button href={`${siteUrl}/dashboard`} style={styles.button}>Go to Dashboard →</Button>
          </Section>
          
          <Text style={styles.manageText}>
            Manage your subscription anytime from your <Link href={`${siteUrl}/settings`} style={styles.footerLink}>account settings</Link>.
          </Text>
          
          <Section style={styles.footer}>
            <Hr style={styles.divider} />
            <Text style={styles.footerText}>
              <Link href="mailto:support@dubaiwealthhub.com" style={{ color: '#898989', textDecoration: 'underline' }}>support@dubaiwealthhub.com</Link>
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
    const { email, name, tier, amount, nextBillingDate, siteUrl = 'https://dubaiwealthhub.com' }: SubscriptionConfirmedRequest = await req.json();
    
    console.log(`[SUBSCRIPTION-CONFIRMED-EMAIL] Sending to ${email}`);

    const html = await renderAsync(React.createElement(SubscriptionConfirmedEmail, { name, tier, amount, nextBillingDate, siteUrl }))

    const tierName = tier === 'elite' ? 'Dubai Elite' : 'Dubai Investor'

    const { data, error } = await resend.emails.send({
      from: "Dubai Wealth Hub <billing@dubaiwealthhub.com>",
      to: [email],
      subject: `Welcome to ${tierName}! Your subscription is confirmed`,
      html,
    });

    if (error) {
      console.error("[SUBSCRIPTION-CONFIRMED-EMAIL] Error:", error);
      throw error;
    }

    console.log("[SUBSCRIPTION-CONFIRMED-EMAIL] Sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[SUBSCRIPTION-CONFIRMED-EMAIL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
