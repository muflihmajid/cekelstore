# WhatsApp Checkout

The checkout helper builds a WhatsApp URL from cart data and a store phone number.

## Normalize Indonesian Phone Numbers

```ts
import { normalizeIndonesianPhoneNumber } from 'cekel-storefront';

normalizeIndonesianPhoneNumber('081234567890');
// 6281234567890
```

Rules:

- Removes non-numeric characters
- Converts `0...` to `62...`
- Converts `8...` to `628...`
- Keeps `62...`
- Stores `+62...` without the plus sign

## Create Checkout URL

```ts
import { createCheckoutMessage, createWhatsAppUrl } from 'cekel-storefront';

const message = createCheckoutMessage({
  storeName: 'Warung Segar',
  items: [{ productId: 'esteh', name: 'Es Teh', price: 10000, quantity: 2 }],
  subtotal: 20000,
});

const url = createWhatsAppUrl('081234567890', message);
```

The URL can be opened in a new browser tab or used as an anchor `href`.
