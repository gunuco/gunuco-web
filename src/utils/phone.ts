export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function canPingPhone(phone: string): boolean {
  return phoneDigits(phone).length >= 10;
}

export function telHref(phone: string): string {
  const digits = phoneDigits(phone);
  return digits ? `tel:+${digits}` : '';
}

export function smsHref(phone: string, body?: string): string {
  const digits = phoneDigits(phone);
  if (!digits) return '';
  return body ? `sms:+${digits}?body=${encodeURIComponent(body)}` : `sms:+${digits}`;
}

export function whatsappHref(phone: string, text?: string): string {
  const digits = phoneDigits(phone);
  if (!digits) return '';
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}
