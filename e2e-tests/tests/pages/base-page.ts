import type { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  navLink(name: string | RegExp): Locator {
    return this.page.locator('nav.navbar').getByRole('link', { name });
  }

  async goHome(): Promise<void> {
    await this.navLink(/Home/i).click();
  }

  async goFindOwners(): Promise<void> {
    await this.navLink(/Find Owners/i).click();
  }

  async goVeterinarians(): Promise<void> {
    await this.navLink(/Veterinarians/i).click();
  }

  async screenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
  }

  languageSelectorToggle(): Locator {
    return this.page.locator('[data-testid="lang-selector"] .dropdown-toggle');
  }

  async switchLanguage(code: string): Promise<void> {
    await this.languageSelectorToggle().click();
    await this.page
      .locator('[data-testid="lang-selector"] .dropdown-item', { hasText: code })
      .click();
    await this.page.waitForLoadState('networkidle');
  }

  async activeLanguage(): Promise<string> {
    return ((await this.languageSelectorToggle().textContent()) ?? '').trim();
  }

  async openWithLanguage(lang: string): Promise<void> {
    await this.goto(`/?lang=${lang}`);
    await this.page.waitForLoadState('networkidle');
  }
}
