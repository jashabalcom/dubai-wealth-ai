/**
 * PDPL-Compliant Consent Texts
 * 
 * These texts are versioned and stored with each consent record
 * to maintain an immutable audit trail for UAE PDPL compliance.
 */

export const CONSENT_TEXTS = {
  version: '1.0',
  effectiveDate: '2025-01-15',
  
  // For guests only - data processing consent
  dataProcessing: "I consent to the collection and processing of my personal data (name, email, phone number) for the purpose of responding to my inquiry, in accordance with UAE Federal Personal Data Protection Law.",
  
  // For all users submitting property inquiries - agent sharing consent
  agentSharing: "I consent to my contact details being shared with a RERA-registered real estate agent who may contact me via phone, email, or WhatsApp regarding this property.",
  
  // For Golden Visa wizard - AI processing consent
  aiProcessing: "I consent to my personal data (nationality, investment preferences, financial information) being processed by AI systems to generate personalized Golden Visa guidance.",
  
  // Optional marketing consent
  marketing: "I would like to receive updates about investment opportunities, property listings, and exclusive offers.",
} as const;

export type ConsentType = 'data_processing' | 'agent_sharing' | 'ai_processing' | 'marketing';
export type FormType = 'property_inquiry' | 'golden_visa_wizard' | 'signup';
