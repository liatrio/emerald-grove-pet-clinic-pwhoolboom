import type { OwnerFormData } from '@pages/owner-page';

function randomDigits(length: number): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * (max - min + 1) + min));
}

export function createOwner(overrides: Partial<OwnerFormData> = {}): OwnerFormData {
  const suffix = `${Date.now()}-${randomDigits(3)}`;

  return {
    firstName: `E2E${suffix}`,
    lastName: `Owner${randomDigits(4)}`,
    address: '123 Main St',
    city: 'Testville',
    telephone: randomDigits(10),
    ...overrides
  };
}
