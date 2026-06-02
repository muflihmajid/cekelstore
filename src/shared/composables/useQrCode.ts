import QRCode from 'qrcode';
import { ref } from 'vue';

export function useQrCode() {
  const qrDataUrl = ref('');

  async function generate(value: string) {
    qrDataUrl.value = await QRCode.toDataURL(value, {
      width: 280,
      margin: 2,
      color: { dark: '#06263F', light: '#FFFFFF' },
    });
  }

  return { qrDataUrl, generate };
}
