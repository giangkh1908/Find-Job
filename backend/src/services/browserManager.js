/**
 * Browser Manager - Singleton for Playwright Chromium instance
 */
import { chromium } from 'playwright';
import { config } from '../config/index.js';

let browser = null;
let isInitializing = false;

export const browserManager = {
export const browserManager = {
  async getBrowser() {
    if (browser) {
      try {
        const isConnected = browser.isConnected();
        if (isConnected) return browser;
        console.warn('[BrowserManager] Browser instance exists but is disconnected. Re-launching...');
      } catch (err) {
        console.warn('[BrowserManager] Error checking browser connection:', err.message);
      }
    }

    if (isInitializing) {
      // Wait for the existing initialization to finish
      while (isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.getBrowser();
    }

    isInitializing = true;
    try {
      console.log('[BrowserManager] Launching Chromium instance...');
      browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox',
        ],
      });

      browser.on('disconnected', () => {
        console.warn('[BrowserManager] Browser disconnected unexpectedly');
        browser = null;
      });

      console.log('[BrowserManager] Chromium launched successfully');
      return browser;
    } catch (err) {
      console.error(`[BrowserManager] Failed to launch browser: ${err.message}`);
      throw err;
    } finally {
      isInitializing = false;
    }
  },

  async close() {
    if (browser) {
      console.log('[BrowserManager] Closing browser instance...');
      await browser.close();
      browser = null;
      console.log('[BrowserManager] Browser closed');
    }
  }
};
