import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base-page';

export class VisitPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  heading(): Locator {
    return this.page.getByRole('heading', { name: /Visit/i });
  }

  async fillVisitDate(date: string): Promise<void> {
    await this.page.locator('input#date').fill(date);
  }

  async fillDescription(description: string): Promise<void> {
    await this.page.locator('input#description').fill(description);
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: /Add Visit/i }).click();
  }
}
