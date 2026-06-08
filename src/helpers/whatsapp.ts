import type { CheckoutPayload } from '../types/store';
import { formatRupiah } from './currency';
import { normalizeIndonesianPhoneNumber } from './phone';

export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  const normalizedPhoneNumber = normalizeIndonesianPhoneNumber(phoneNumber);
  return `https://wa.me/${normalizedPhoneNumber}?text=${encodeURIComponent(message)}`;
}

export function createCheckoutMessage(payload: CheckoutPayload): string {
  const lines = [
    `Hello, I want to order from ${payload.storeName}.`,
    '',
    'Order items:',
    ...payload.items.map(
      (item, index) => `${index + 1}. ${item.name} x${item.quantity} - ${formatRupiah(item.price * item.quantity)}`,
    ),
    '',
    `Subtotal: ${formatRupiah(payload.subtotal)}`,
  ];

  if (payload.customerName) {
    lines.push('', `Name: ${payload.customerName}`);
  }

  if (payload.customerWhatsapp) {
    lines.push(`WhatsApp: ${payload.customerWhatsapp}`);
  }

  if (payload.customerAddress) {
    lines.push(`Address: ${payload.customerAddress}`);
  }

  if (payload.note) {
    lines.push('', `Note: ${payload.note}`);
  }

  return lines.join('\n');
}
