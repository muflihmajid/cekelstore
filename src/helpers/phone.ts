export function normalizeIndonesianPhoneNumber(input: string): string {
  const numeric = input.replace(/\D/g, '');

  if (numeric.startsWith('0')) {
    return `62${numeric.slice(1)}`;
  }

  if (numeric.startsWith('8')) {
    return `62${numeric}`;
  }

  return numeric;
}
