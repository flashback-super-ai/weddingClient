import { Twilio } from 'twilio';

// Type definitions
type TwilioConfig = {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
};

type PhoneNumber = string;
type MessageBody = string;

interface MessageResult {
  sid: string;
  status: string;
  to: string;
  from: string;
  body: string;
  dateCreated: Date;
}

interface TwilioMessageOptions {
  from: string;
  body: string;
  to: string;
}

// Environment variable validation with typing
const getTwilioConfig = (): TwilioConfig => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !whatsappNumber) {
    throw new Error('Missing required Twilio environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER');
  }

  return { accountSid, authToken, whatsappNumber };
};

const config: TwilioConfig = getTwilioConfig();
const client: Twilio = new Twilio(config.accountSid, config.authToken);

export const sendWhatsappMsg = async (to: PhoneNumber, body: MessageBody): Promise<MessageResult> => {
  try {
    console.log(`Sending WhatsApp message to ${to}...`);
    
    const messageOptions: TwilioMessageOptions = {
      from: `whatsapp:${config.whatsappNumber}`,
      body,
      to,
    };
    
    const message = await client.messages.create(messageOptions);
    
    const result: MessageResult = {
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      dateCreated: message.dateCreated
    };
    
    console.log('Message sent successfully:', result.sid);
    return result;
  } catch (error: unknown) {
    console.error('Error sending WhatsApp message:', error);
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to send WhatsApp message: ${errorMessage}`);
  }
};

export const sendWhatsappMsgToList = async (recipients: PhoneNumber[], body: MessageBody): Promise<MessageResult[]> => {
  if (!recipients.length) {
    throw new Error('Recipients list cannot be empty');
  }

  try {
    console.log(`Sending WhatsApp message to ${recipients.length} recipients...`);
    
    const promises: Promise<any>[] = recipients.map((recipient: PhoneNumber) => {
      const messageOptions: TwilioMessageOptions = {
        from: `whatsapp:${config.whatsappNumber}`,
        body,
        to: recipient,
      };
      return client.messages.create(messageOptions);
    });
    
    const messages = await Promise.all(promises);
    
    const results: MessageResult[] = messages.map((message: any) => ({
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      dateCreated: message.dateCreated
    }));
    
    console.log(`Successfully sent ${results.length} messages`);
    return results;
  } catch (error: unknown) {
    console.error('Error sending WhatsApp messages:', error);
    const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to send WhatsApp messages: ${errorMessage}`);
  }
};

// Utility functions with typing
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex: RegExp = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

export const formatPhoneNumberForWhatsApp = (phoneNumber: string): PhoneNumber => {
  const cleaned: string = phoneNumber.replace(/\D/g, '');
  return `+${cleaned}`;
};
