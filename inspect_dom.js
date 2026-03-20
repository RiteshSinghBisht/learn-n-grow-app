const { chromium } = require('playwright');
const server = require('http').createServer(require('serve-handler'));
server.listen(3000, async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('http://localhost:3000');
        // Let it load
        await page.waitForTimeout(1000);
        // Navigate or just dump the HTML of the #page-activity-modals-have top-nav
        // Let's click "Start Learning"
        await page.click('#start-learning-btn');
        await page.waitForTimeout(500);
        // Open the selected test
        await page.evaluate(() => {
            selectTest('test-self-assessment');
        });
        await page.waitForTimeout(1000);
        
        // Expose top nav html
        const topNavHtml = await page.$eval('#page-activity-modals-have .top-nav', el => el.outerHTML);
        console.log("HTML:", topNavHtml);
        
        // Get bounding boxes to find the rectangle
        const rects = await page.evaluate(() => {
            const els = document.querySelectorAll('#page-activity-modals-have .top-nav *');
            let results = [];
            els.forEach(el => {
                const rect = el.getBoundingClientRect();
                results.push({ tag: el.tagName, class: el.className, rect: rect.toJSON() });
            });
            return results;
        });
        console.log("Rects:", JSON.stringify(rects, null, 2));

        await browser.close();
    } catch (e) {
        console.error(e);
    }
    server.close();
});
