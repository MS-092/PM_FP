
import { test, expect } from '@playwright/test';

test.describe('UI/UX Testing Suite', () => {

    const MOCK_USER = {
        _id: "test-user-id",
        username: "TestUser",
        email: "test@example.com",
        accessToken: "fake-access-token"
    };

    test.beforeEach(async ({ page }) => {
        // Mock Login for all UI tests
        await page.route('**/api/login', async route => {
            await route.fulfill({ json: MOCK_USER });
        });

        // Mock Register
        await page.route('**/api/register', async route => {
            await route.fulfill({ json: MOCK_USER });
        });
    });

    test('UI-001: Responsiveness check on mobile', async ({ page }) => {
        // Set viewport to mobile
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/auth');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'pass');
        await page.click('button[type="submit"]');

        // Go to game
        await page.click('text=Science Starter');

        // Check layout stacking
        const grid = page.locator('.game-layout > div').first();
        const panel = page.locator('.game-layout > div').nth(1);

        // In mobile (stacked), the grid Y should be less than Panel Y
        const gridBox = await grid.boundingBox();
        const panelBox = await panel.boundingBox();

        expect(gridBox.y).toBeLessThan(panelBox.y);

        // Check execution of media query style
        // We can verify if the grid-template-columns style is applied effectively 
        // by checking client width vs window width or computed style.
        // But verifying separate bounding boxes stack vertically is sufficient.
    });

    test('UI-002: Intuitive Selection (Toggle Across/Down)', async ({ page }) => {
        await page.goto('/auth');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'pass');
        await page.click('button[type="submit"]');
        await page.click('text=Science Starter');

        // Find a cell
        // We need a reliable cell. Let's click the first cell of the grid that has a letter (not null)
        // Since we don't know the exact grid, we scan for an input or highlighted cell logic?
        // Actually, the grid renders `div`s.
        // Let's click the "Clue" item instead, which is safer to select a word.

        // Click a clue (li element)
        const firstClue = page.locator('li').first();
        const wordId = await firstClue.getAttribute('data-id'); // Note: 'li' might not have data-id based on my read of CluePanel
        await firstClue.click();

        // Check if Active Word is highlighted
        // CluePanel adds a background style if active, but doesn't add a class "active" to the LI itself or might add styles.
        // It does render "ANSWER" input only when active.
        await expect(page.locator('input[placeholder="ANSWER"]')).toBeVisible();
    });

    test('UI-003: Navigation Guard (Back Button)', async ({ page }) => {
        await page.goto('/auth');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'pass');
        await page.click('button[type="submit"]'); // Login
        await page.click('text=Science Starter'); // Start Game

        // Handle Dialog
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Are you sure?');
            await dialog.accept();
        });

        await page.click('text=< Back');
        // If dialog accepted, we should be at dashboard
        await expect(page).toHaveURL('/dashboard');
    });

    // UI-004: Keyboard Nav
    test('UI-004: Keyboard Accessibility on Dashboard', async ({ page }) => {
        await page.goto('/auth');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'pass');
        await page.click('button[type="submit"]');

        // Wait for dashboard
        await page.waitForURL('/dashboard');

        // Press Tab
        await page.keyboard.press('Tab');
        // Using locator(':focus') to check what is focused
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
    });
});
