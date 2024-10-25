import {Browser, launch} from 'puppeteer';

export const puppeteer = async()=>{
    const browser: Browser = await launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-fake-ui-for-media-stream',
            '--disable-audio-output',
        ],
    });
    const page = await browser.newPage();
  
    // Set User-Agent if necessary
    await page.setUserAgent('Your desired User-Agent');
  
    // Navigate to Yahoo Finance
    await page.goto('https://finance.yahoo.com');
  
    // Wait for the page to load
    await page.waitForSelector('body');
  
    // Get cookies and user-agent
    const cookies = await page.cookies();
    const userAgent = await page.evaluate(() => navigator.userAgent);
  
    console.log('Cookies:', cookies);
    console.log('User-Agent:', userAgent);
  
    await browser.close();
  
}

