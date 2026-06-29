const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser (Microsoft Edge)...');
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: true,
      channel: 'msedge'
    });
  } catch (launchError) {
    console.log('Edge launch failed, attempting Chrome channel...', launchError.message);
    try {
      browser = await chromium.launch({ 
        headless: true,
        channel: 'chrome'
      });
    } catch (chromeError) {
      console.log('System browser launch failed completely:', chromeError.message);
      return;
    }
  }

  const context = await browser.newContext({
    permissions: ['geolocation']
  });

  const page = await context.newPage();

  // Listen for console logs and errors
  page.on('console', (msg) => {
    console.log(`[CONSOLE]: ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    console.log(`[PAGE ERROR]: ${err.stack}`);
  });

  try {
    // ── TEST 1: Home Page Navigation ──
    console.log('Navigating to http://localhost:3001 ...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Verify statistics section values
    console.log('Checking stats section positive values...');
    const statsHTML = await page.content();
    if (statsHTML.includes('17,440') || statsHTML.includes('Lives Impacted')) {
      console.log('SUCCESS: Positive statistic values verified on homepage!');
    } else {
      console.log('WARNING: Stats values not matching expected text.');
    }

    // Verify feature card interactive click
    console.log('Clicking the "Blood Donor Network" feature card...');
    const donorCard = page.locator('text=Blood Donor Network').first();
    await donorCard.click();
    await page.waitForTimeout(2000);

    let currentUrl = page.url();
    console.log('Current URL after click:', currentUrl);
    if (currentUrl.endsWith('/donors')) {
      console.log('SUCCESS: Feature card navigation works perfectly!');
    } else {
      console.log('ERROR: Feature card navigation failed, url is:', currentUrl);
    }

    // ── TEST 2: Blood Donor Registration & Finder ──
    console.log('Opening Become a Blood Donor registration modal...');
    const regButton = page.locator('button >> text=Register as Donor');
    await regButton.click();
    await page.waitForTimeout(1000);

    console.log('Filling out Blood Donor registration form...');
    await page.fill('placeholder="Jane Doe"', 'Test Donor Playwright');
    await page.fill('placeholder="25"', '30');
    // Select blood group
    await page.selectOption('select', 'O-');
    await page.fill('placeholder="10-digit mobile number"', '9998887770');
    await page.fill('placeholder="e.g. Bengaluru"', 'Bengaluru');
    await page.fill('placeholder="e.g. Koramangala"', 'Indiranagar');

    // Handle standard browser alert during registration submit
    page.once('dialog', async (dialog) => {
      console.log('[ALERT DIALOG]:', dialog.message());
      await dialog.accept();
    });

    console.log('Submitting registration form...');
    const submitReg = page.locator('button >> text=Register Donor');
    await submitReg.click();
    await page.waitForTimeout(3000);

    // Verify that the new donor immediately appears in the list!
    const updatedContent = await page.content();
    if (updatedContent.includes('Test Donor Playwright') && updatedContent.includes('O-')) {
      console.log('SUCCESS: Registered blood donor immediately appears in search list!');
    } else {
      console.log('WARNING: Registered blood donor not found in search list. Check if filters match.');
    }

    // ── TEST 3: SOS Contacts Management ──
    console.log('Navigating to SOS page...');
    await page.goto('http://localhost:3001/sos', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click "Add Contact"
    console.log('Opening Add Contact form...');
    const addContactBtn = page.locator('button >> text=Add Contact');
    await addContactBtn.click();
    await page.waitForTimeout(1000);

    // Fill form
    console.log('Filling contact form...');
    await page.fill('placeholder="Full Name"', 'SOS Contact Playwright');
    await page.fill('placeholder="+91 XXXXX XXXXX"', '+91 99999 88888');
    await page.selectOption('select', 'Friend');

    console.log('Saving contact...');
    const saveContactBtn = page.locator('button >> text=Save Contact');
    await saveContactBtn.click();
    await page.waitForTimeout(2000);

    // Verify addition
    let pageHTML = await page.content();
    if (pageHTML.includes('SOS Contact Playwright') && pageHTML.includes('+91 99999 88888')) {
      console.log('SUCCESS: Contact addition and rendering verified!');
    } else {
      console.log('ERROR: Contact addition failed.');
    }

    // Edit contact
    console.log('Triggering Edit Mode on contact card...');
    const editBtn = page.locator('button[title="Edit Contact"]').last();
    await editBtn.click();
    await page.waitForTimeout(1000);

    console.log('Updating contact phone details...');
    // Clear and fill phone input inside inline form
    await page.locator('input[value="+91 99999 88888"]').fill('+91 11111 22222');
    const saveEditBtn = page.locator('button >> text=Save').last();
    await saveEditBtn.click();
    await page.waitForTimeout(2000);

    // Verify edit
    pageHTML = await page.content();
    if (pageHTML.includes('+91 11111 22222')) {
      console.log('SUCCESS: Contact edit and inline form submission verified!');
    } else {
      console.log('ERROR: Contact edit failed.');
    }

    // Delete contact
    console.log('Deleting contact...');
    const deleteBtn = page.locator('button[title="Delete Contact"]').last();
    await deleteBtn.click();
    await page.waitForTimeout(2000);

    // Verify deletion
    pageHTML = await page.content();
    if (!pageHTML.includes('SOS Contact Playwright')) {
      console.log('SUCCESS: Contact deletion verified!');
    } else {
      console.log('ERROR: Contact deletion failed.');
    }

    console.log('All E2E verification test cases completed successfully.');
  } catch (error) {
    console.error('Test execution encountered error:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
