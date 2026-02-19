import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { BasePage } from './base-page';

export class PetPage extends BasePage {

  constructor(page: Page) {
    super(page);
  }

  async clickDeletePetButton(petName: string): Promise<void> {
    const petRow = this.page.locator('tr').filter({
      has: this.page.locator('dd', { hasText: petName })
    });
    await petRow.getByRole('button', { name: /Delete Pet/i }).first().click();
  }

  async confirmDeletion(): Promise<void> {
    const modal = this.page.locator('#deletePetModal');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: /Confirm Delete/i }).click();
  }

}
