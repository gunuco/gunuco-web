export function phoneDigits(phone: string): string {
  return String(phone ?? '').replace(/\D/g, '');
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

export function mailtoHref(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

/** Open tel/sms/mailto without navigating this page, and http(s) in a new tab. */
export function openContactHref(href: string) {
  if (!href) return;
  if (/^https?:/i.test(href)) {
    window.open(href, '_blank', 'noopener,noreferrer');
    return;
  }
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.display = 'none';
  frame.src = href;
  document.body.appendChild(frame);
  window.setTimeout(() => frame.remove(), 2000);
}
