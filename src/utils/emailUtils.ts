
import { toast } from '@/hooks/use-toast';

export interface EmailData {
  to: string;
  firstName: string;
  lastName: string;
  company: string;
  title?: string;
}

export const openEmailClient = async (emailData: EmailData) => {
  const { to, firstName, lastName, company, title } = emailData;
  
  // Create personalized subject and body
  const subject = encodeURIComponent(`Re: ${company} - ${title ? title + ' ' : ''}Opportunity`);
  const body = encodeURIComponent(
    `Hi ${firstName},\n\nI hope this email finds you well. I wanted to reach out regarding potential opportunities at ${company}.\n\nBest regards`
  );
  
  // Copy email to clipboard first
  try {
    await navigator.clipboard.writeText(to);
    toast({
      title: 'Email copied',
      description: `${to} has been copied to clipboard.`,
    });
  } catch (error) {
    console.log('Clipboard copy failed, continuing with email client');
  }

  // Open mail client with pre-filled content
  const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;
  window.open(mailtoUrl, '_self');
};

export const copyEmailOnly = async (email: string) => {
  try {
    await navigator.clipboard.writeText(email);
    toast({
      title: 'Email copied',
      description: `${email} has been copied to clipboard.`,
    });
    return true;
  } catch (error) {
    toast({
      title: 'Copy failed',
      description: 'Failed to copy email to clipboard.',
      variant: 'destructive',
    });
    return false;
  }
};
