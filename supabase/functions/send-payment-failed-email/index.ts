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

interface PaymentFailedRequest {
  email: string
  name: string
  tier: 'investor' | 'elite'
  amount: string
  retryDate?: string
  siteUrl?: string
}

const styles = {
  main: { backgroundColor: '#0A0F1D', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  container: { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' },
  header: { textAlign: 'center' as const, paddingBottom: '32px', borderBottom: '1px solid rgba(203, 184, 158, 0.2)' },
  warningBanner: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'center' as const, border: '1px solid rgba(245, 158, 11, 0.3)' },
  warningIcon: { fontSize: '32px', margin: '0 0 8px 0' },
  warningText: { color: '#FCD34D', fontSize: '16px', fontWeight: '600', margin: '0' },
  heading: { color: '#FFFFFF', fontSize: '26px', fontWeight: '700', textAlign: 'center' as const, margin: '0 0 16px 0' },
  paragraph: { color: '#EAE8E3', fontSize: '16px', lineHeight: '1.6', textAlign: 'center' as const, margin: '0 0 24px 0' },
  reasonsCard: { backgroundColor: '#101010', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', border: '1px solid rgba(203, 184, 158, 0.15)' },
  reasonsTitle: { color: '#FFFFFF', fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0' },
  reasonItem: { color: '#898989', fontSize: '14px', margin: '0 0 6px 0' },
  ctaSection: { textAlign: 'center' as const, margin: '32px 0' },
  ctaText: { color: '#EAE8E3', fontSize: '15px', margin: '0 0 16px 0' },
  button: { backgroundColor: '#CBB89E', color: '#0A0F1D', padding: '14px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', textDecoration: 'none', display: 'inline-block' },
  retrySection: { backgroundColor: 'rgba(203, 184, 158, 0.08)', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' },
  retryText: { color: '#EAE8E3', fontSize: '14px', lineHeight: '1.6', margin: '0', textAlign: 'center' as const },
  urgencySection: { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' },
  urgencyTitle: { color: '#FCA5A5', fontSize: '15px', fontWeight: '600', margin: '0 0 12px 0' },
  urgencyText: { color: '#EAE8E3', fontSize: '14px', margin: '0 0 12px 0' },
  lossItem: { color: '#898989', fontSize: '13px', margin: '0 0 4px 0' },
  helpSection: { textAlign: 'center' as const, marginTop: '24px' },
  helpText: { color: '#898989', fontSize: '14px', margin: '0' },
  footer: { paddingTop: '32px' },
  divider: { borderColor: 'rgba(203, 184, 158, 0.2)', margin: '0 0 24px 0' },
  footerLink: { color: '#CBB89E', textDecoration: 'underline' },
  copyright: { color: '#666666', fontSize: '11px', textAlign: 'center' as const, margin: '0' },
}

const PaymentFailedEmail = ({ name, tier, amount, retryDate, siteUrl }: { name: string, tier: string, amount: string, retryDate?: string, siteUrl: string }) => {
  const isElite = tier === 'elite'
  const tierName = isElite ? 'Dubai Elite' : 'Dubai Investor'
  
  return (
    <Html>
      <Head />
      <Preview>Action needed: Your payment could not be processed</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={{ color: '#CBB89E', fontSize: '24px', fontWeight: '700', margin: '0' }}>Dubai Wealth Hub</Text>
          </Section>
          
          <Section style={styles.warningBanner}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>Payment Issue</Text>
          </Section>
          
          <Heading style={styles.heading}>{name}, we could not process your payment</Heading>
          
          <Text style={styles.paragraph}>
            We tried to charge your card for your {tierName} membership ({amount}/month), but the payment was unsuccessful.
          </Text>
          
          <Section style={styles.reasonsCard}>
            <Text style={styles.reasonsTitle}>Common reasons this happens:</Text>
            <Text style={styles.reasonItem}>• Expired or cancelled card</Text>
            <Text style={styles.reasonItem}>• Insufficient funds</Text>
            <Text style={styles.reasonItem}>• Card issuer declined the transaction</Text>
            <Text style={styles.reasonItem}>• Outdated billing information</Text>
          </Section>
          
          <Section style={styles.ctaSection}>
            <Text style={styles.ctaText}>Please update your payment method to avoid losing access:</Text>
            <Button href={`${siteUrl}/settings`} style={styles.button}>Update Payment Method →</Button>
          </Section>
          
          {retryDate && (
            <Section style={styles.retrySection}>
              <Text style={styles.retryText}>
                We'll automatically retry your payment on <strong>{retryDate}</strong>. Please update your payment method before then to avoid service interruption.
              </Text>
            </Section>
          )}
          
          <Section style={styles.urgencySection}>
            <Text style={styles.urgencyTitle}>What happens if I don't update?</Text>
            <Text style={styles.urgencyText}>After 3 failed payment attempts, your subscription will be cancelled and you'll lose access to:</Text>
            <Text style={styles.lossItem}>• Academy courses & video lessons</Text>
            <Text style={styles.lossItem}>• Investment calculators & AI tools</Text>
            <Text style={styles.lossItem}>• Community access & connections</Text>
            <Text style={styles.lossItem}>• Saved properties & portfolio</Text>
          </Section>
          
          <Section style={styles.helpSection}>
            <Text style={styles.helpText}>
              Need help? Reply to this email or contact us at <Link href="mailto:support@dubaiwealthhub.com" style={styles.footerLink}>support@dubaiwealthhub.com</Link>
            </Text>
          </Section>
          
          <Section style={styles.footer}>
            <Hr style={styles.divider} />
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
    const { email, name, tier, amount, retryDate, siteUrl = 'https://dubaiwealthhub.com' }: PaymentFailedRequest = await req.json();
    
    console.log(`[PAYMENT-FAILED-EMAIL] Sending to ${email}`);

    const html = await renderAsync(React.createElement(PaymentFailedEmail, { name, tier, amount, retryDate, siteUrl }))

    const { data, error } = await resend.emails.send({
      from: "Dubai Wealth Hub <billing@dubaiwealthhub.com>",
      to: [email],
      subject: `Action needed: Payment failed for your subscription`,
      html,
    });

    if (error) {
      console.error("[PAYMENT-FAILED-EMAIL] Error:", error);
      throw error;
    }

    console.log("[PAYMENT-FAILED-EMAIL] Sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[PAYMENT-FAILED-EMAIL] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
