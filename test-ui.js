const { chromium } = require('playwright');

async function runTest() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to app
    console.log('Navigating to http://localhost:3001');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    console.log('\n=== WAITING FOR USER TO LOGIN ===');
    console.log('Please log in to the application in the browser window.');
    console.log('Press Enter in this terminal when you are done logging in...\n');

    // Return the page object so we can continue testing after user logs in
    return { browser, context, page };
  } catch (error) {
    console.error('Error during initial setup:', error);
    await browser.close();
    throw error;
  }
}

// Start the test
runTest().then(({ browser, context, page }) => {
  console.log('Test setup complete. Browser window is open.');
  console.log('Waiting for user to complete login...');

  // Keep the script running
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  let loginComplete = false;

  process.stdin.on('data', async (text) => {
    if (!loginComplete && text.trim().length === 0) {
      loginComplete = true;
      console.log('\n=== CONTINUING WITH AUTOMATED TESTS ===\n');

      try {
        await continueTests(page);
        console.log('\n=== TEST COMPLETE ===');
        console.log('Browser window will remain open for inspection.');
      } catch (error) {
        console.error('Error during testing:', error);
      }
    }
  });
}).catch(error => {
  console.error('Failed to start test:', error);
  process.exit(1);
});

async function continueTests(page) {
  const errors = [];

  console.log('Testing: Main page load');
  try {
    await page.waitForSelector('body', { timeout: 5000 });
    console.log('✓ Main page loaded');
  } catch (error) {
    errors.push({ test: 'Main page load', error: error.message });
    console.log('✗ Main page load failed:', error.message);
  }

  // Test navigation
  console.log('\nTesting: Navigation elements');
  try {
    const nav = await page.locator('nav, header, [role="navigation"]').first();
    if (await nav.count() > 0) {
      console.log('✓ Navigation found');
    } else {
      errors.push({ test: 'Navigation', error: 'No navigation element found' });
      console.log('✗ No navigation element found');
    }
  } catch (error) {
    errors.push({ test: 'Navigation', error: error.message });
    console.log('✗ Navigation test failed:', error.message);
  }

  // Test projects page
  console.log('\nTesting: Projects page');
  try {
    // Look for links or buttons that might lead to projects
    const projectLink = page.locator('a[href*="project"], button:has-text("Project")').first();
    if (await projectLink.count() > 0) {
      await projectLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✓ Navigated to projects');
    } else {
      console.log('ℹ No projects link found, checking if already on projects page');
    }
  } catch (error) {
    errors.push({ test: 'Projects page', error: error.message });
    console.log('✗ Projects page test failed:', error.message);
  }

  // Test bookmarks/folders
  console.log('\nTesting: Bookmarks/Folders functionality');
  try {
    const bookmarkElements = await page.locator('[data-testid*="bookmark"], [class*="bookmark"], [role="article"]').count();
    const folderElements = await page.locator('[data-testid*="folder"], [class*="folder"]').count();
    console.log(`✓ Found ${bookmarkElements} bookmark elements and ${folderElements} folder elements`);
  } catch (error) {
    errors.push({ test: 'Bookmarks/Folders', error: error.message });
    console.log('✗ Bookmarks/Folders test failed:', error.message);
  }

  // Test search functionality
  console.log('\nTesting: Search functionality');
  try {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]').first();
    if (await searchInput.count() > 0) {
      console.log('✓ Search input found');
      await searchInput.fill('test search');
      await page.waitForTimeout(1000);
      console.log('✓ Search input interaction successful');
    } else {
      console.log('ℹ No search input found');
    }
  } catch (error) {
    errors.push({ test: 'Search', error: error.message });
    console.log('✗ Search test failed:', error.message);
  }

  // Test AI chat if available
  console.log('\nTesting: AI Chat functionality');
  try {
    const chatButton = page.locator('button:has-text("Chat"), button:has-text("AI"), [role="button"]:has-text("Ask")').first();
    if (await chatButton.count() > 0) {
      await chatButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ AI chat button clicked');

      const chatInput = page.locator('textarea, input[type="text"]').last();
      if (await chatInput.count() > 0) {
        await chatInput.fill('test message');
        console.log('✓ Chat input interaction successful');
      }
    } else {
      console.log('ℹ No AI chat button found');
    }
  } catch (error) {
    errors.push({ test: 'AI Chat', error: error.message });
    console.log('✗ AI chat test failed:', error.message);
  }

  // Test user menu/settings
  console.log('\nTesting: User menu/settings');
  try {
    const userMenu = page.locator('[role="button"]:has([alt*="user" i]), button:has-text("Settings"), button:has-text("Profile")').first();
    if (await userMenu.count() > 0) {
      await userMenu.click();
      await page.waitForTimeout(500);
      console.log('✓ User menu opened');
    } else {
      console.log('ℹ No user menu button found');
    }
  } catch (error) {
    errors.push({ test: 'User menu', error: error.message });
    console.log('✗ User menu test failed:', error.message);
  }

  // Check for console errors
  console.log('\nChecking for console errors...');
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Wait a bit to collect any errors
  await page.waitForTimeout(2000);

  if (consoleErrors.length > 0) {
    errors.push({ test: 'Console errors', error: consoleErrors.join('\n') });
    console.log(`✗ Found ${consoleErrors.length} console errors`);
  } else {
    console.log('✓ No console errors detected');
  }

  // Save errors to file if any
  if (errors.length > 0) {
    const fs = require('fs');
    const path = require('path');

    // Create errors directory if it doesn't exist
    const errorsDir = path.join(__dirname, 'docs', 'errors');
    if (!fs.existsSync(errorsDir)) {
      fs.mkdirSync(errorsDir, { recursive: true });
    }

    // Group errors by functionality
    const errorsByCategory = {
      navigation: errors.filter(e => e.test.toLowerCase().includes('nav') || e.test.toLowerCase().includes('page')),
      bookmarks: errors.filter(e => e.test.toLowerCase().includes('bookmark') || e.test.toLowerCase().includes('folder')),
      search: errors.filter(e => e.test.toLowerCase().includes('search')),
      chat: errors.filter(e => e.test.toLowerCase().includes('chat')),
      console: errors.filter(e => e.test.toLowerCase().includes('console')),
      other: errors.filter(e =>
        !e.test.toLowerCase().includes('nav') &&
        !e.test.toLowerCase().includes('page') &&
        !e.test.toLowerCase().includes('bookmark') &&
        !e.test.toLowerCase().includes('folder') &&
        !e.test.toLowerCase().includes('search') &&
        !e.test.toLowerCase().includes('chat') &&
        !e.test.toLowerCase().includes('console')
      )
    };

    // Write error files for each category that has errors
    for (const [category, categoryErrors] of Object.entries(errorsByCategory)) {
      if (categoryErrors.length > 0) {
        const filename = path.join(errorsDir, `${category}-errors.md`);
        let content = `# ${category.charAt(0).toUpperCase() + category.slice(1)} Errors\n\n`;
        content += `Found ${categoryErrors.length} error(s):\n\n`;

        categoryErrors.forEach((err, index) => {
          content += `## ${index + 1}. ${err.test}\n\n`;
          content += `\`\`\`\n${err.error}\n\`\`\`\n\n`;
        });

        fs.writeFileSync(filename, content);
        console.log(`\nError log saved: ${filename}`);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total errors found: ${errors.length}`);
    console.log(`Error files created in: docs/errors/`);
  } else {
    console.log('\n=== SUMMARY ===');
    console.log('No errors found during testing!');
  }
}
