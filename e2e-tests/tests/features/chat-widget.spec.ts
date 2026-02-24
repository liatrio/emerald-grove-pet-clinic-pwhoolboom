import { test, expect } from '@fixtures/base-test';
import type { Page } from '@playwright/test';

import { HomePage } from '@pages/home-page';

/**
 * Mocks POST /api/chat to return a synthetic text/event-stream response.
 * Tokens are emitted with an optional per-token delay (ms) to allow
 * asserting the intermediate disabled state.
 */
async function mockChatApi(
  page: Page,
  tokens: string[] = ['Hello', '!', ' How', ' can', ' I', ' help', '?'],
  tokenDelayMs = 0,
): Promise<void> {
  await page.route('/api/chat', async (route) => {
    const lines: string[] = [];
    for (const token of tokens) {
      lines.push(`data: ${JSON.stringify({ token })}`);
      lines.push('');
    }
    lines.push('data: [DONE]');
    lines.push('');

    if (tokenDelayMs > 0) {
      // Fulfil with a delay to simulate slow streaming so the disabled state is observable
      await new Promise((resolve) => setTimeout(resolve, tokenDelayMs));
    }

    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
      body: lines.join('\n'),
    });
  });
}

test.describe('Chat Widget', () => {
  test('chat toggle shows and hides the panel', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();

    // Panel is hidden by default
    await expect(homePage.chatPanel()).toBeHidden();

    // Click toggle — panel becomes visible
    await homePage.chatToggle().click();
    await expect(homePage.chatPanel()).toBeVisible();

    // Click toggle again — panel is hidden
    await homePage.chatToggle().click();
    await expect(homePage.chatPanel()).toBeHidden();
  });

  test('sending a message shows user message in panel', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await mockChatApi(page);

    await homePage.openChat();
    await homePage.sendMessage('Hello');

    await expect(
      homePage.chatMessages().locator('[data-role="user"]', { hasText: 'Hello' }),
    ).toBeVisible();
  });

  test('bot response streams into panel', async ({ page }, testInfo) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await mockChatApi(page, ['Hello', '!', ' How', ' can', ' I', ' help', '?']);

    await homePage.openChat();
    await homePage.sendMessage('Hi');

    await expect(homePage.lastBotMessage()).toHaveText('Hello! How can I help?');

    await page.screenshot({
      path: testInfo.outputPath('e2e-chat-full-flow.png'),
      fullPage: true,
    });
  });

  test('input is disabled during streaming and re-enabled after', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();

    // Use a slow mock so we can assert the disabled state before the stream ends
    let resolveStream!: () => void;
    const streamGate = new Promise<void>((resolve) => {
      resolveStream = resolve;
    });

    await page.route('/api/chat', async (route) => {
      // Wait until the test releases the gate, then respond
      await streamGate;
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: 'data: {"token":"ok"}\n\ndata: [DONE]\n\n',
      });
    });

    await homePage.openChat();
    // Kick off the send — do NOT await (the route is blocked)
    const sendPromise = homePage.sendMessage('test');

    // Input and send button should be disabled while streaming
    await expect(homePage.chatInput()).toBeDisabled();
    await expect(homePage.chatSend()).toBeDisabled();

    // Release the stream gate and wait for send to finish
    resolveStream();
    await sendPromise;

    // After stream ends, input and send should be re-enabled
    await expect(homePage.chatInput()).toBeEnabled();
    await expect(homePage.chatSend()).toBeEnabled();
  });

  test('session ID persists across page navigation', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();

    // Initially no session ID
    const initialId = await page.evaluate(() => sessionStorage.getItem('chatSessionId'));
    expect(initialId).toBeNull();

    // Opening chat triggers session ID creation
    await homePage.openChat();

    const sessionId = await page.evaluate(() => sessionStorage.getItem('chatSessionId'));
    expect(sessionId).not.toBeNull();

    // Navigate to another page (same tab — sessionStorage persists)
    await page.goto('/vets.html');
    await page.waitForLoadState('networkidle');

    const sessionIdAfterNav = await page.evaluate(() => sessionStorage.getItem('chatSessionId'));
    expect(sessionIdAfterNav).toBe(sessionId);
  });
});
