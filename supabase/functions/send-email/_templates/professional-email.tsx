
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ProfessionalEmailProps {
  content: string;
  leadName: string;
  senderName: string;
  senderEmail: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyAddress?: string;
}

export const ProfessionalEmail = ({
  content,
  leadName,
  senderName,
  senderEmail,
  companyName,
  companyLogo,
  companyWebsite,
  companyAddress,
}: ProfessionalEmailProps) => (
  <Html>
    <Head />
    <Preview>{content.substring(0, 150)}...</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          {companyLogo ? (
            <Img
              src={companyLogo}
              width="150"
              height="auto"
              alt={companyName}
              style={logo}
            />
          ) : (
            <Heading style={companyTitle}>{companyName}</Heading>
          )}
        </Section>

        {/* Main Content */}
        <Section style={contentSection}>
          <Text style={greeting}>Hello {leadName},</Text>
          
          <div style={emailContent}>
            {content.split('\n').map((paragraph, index) => (
              <Text key={index} style={paragraph ? text : spacer}>
                {paragraph || '\u00A0'}
              </Text>
            ))}
          </div>
        </Section>

        <Hr style={divider} />

        {/* Signature */}
        <Section style={signature}>
          <Text style={signatureName}>{senderName}</Text>
          <Text style={signatureTitle}>{companyName}</Text>
          <Text style={signatureContact}>
            Email: <Link href={`mailto:${senderEmail}`} style={link}>{senderEmail}</Link>
          </Text>
          {companyWebsite && (
            <Text style={signatureContact}>
              Website: <Link href={companyWebsite} style={link}>{companyWebsite}</Link>
            </Text>
          )}
          {companyAddress && (
            <Text style={signatureContact}>{companyAddress}</Text>
          )}
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            This email was sent from {companyName} using XONECT powered by Thomas & Niyogi
          </Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ProfessionalEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 30px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e6ebf1',
};

const logo = {
  margin: '0 auto',
};

const companyTitle = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
};

const contentSection = {
  padding: '30px',
};

const greeting = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '1.4',
  margin: '0 0 20px',
};

const emailContent = {
  margin: '20px 0',
};

const text = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const spacer = {
  margin: '8px 0',
  height: '1px',
};

const divider = {
  borderColor: '#e6ebf1',
  margin: '20px 30px',
};

const signature = {
  padding: '0 30px 20px',
};

const signatureName = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 5px',
};

const signatureTitle = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 10px',
};

const signatureContact = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '3px 0',
};

const link = {
  color: '#2563eb',
  textDecoration: 'none',
};

const footer = {
  padding: '20px 30px',
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e6ebf1',
};

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '5px 0',
  textAlign: 'center' as const,
};
