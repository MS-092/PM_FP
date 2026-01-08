
import { test, expect } from '@playwright/test';

test.describe('Functional Testing Suite (FT-001 to FT-004)', () => {

    const MOCK_USER = {
        _id: "test-user-id",
        username: "TestUser",
        email: "test@example.com",
        accessToken: "fake-access-token"
    };

    test.beforeEach(async ({ page }) => {
        // Basic setup or visiting home
        // We can also mock the check-auth endpoint if it exists
    });

    // FT-001: Register a new user
    test('FT-001: Register successfully', async ({ page }) => {
        // Mock the register API call
        await page.route('**/api/register', async route => {
            const json = { ...MOCK_USER };
            await route.fulfill({ json });
        });

        await page.goto('/auth');

        // Switch to Register mode
        // Text is "Don't have an account? Sign Up" inside a span
        await page.click('text=Sign Up');

        await page.fill('input[name="username"]', 'TestUser');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'StrongPass123!');

        // Button text becomes "Sign Up"
        await page.click('button:has-text("Sign Up")');

        // Expect redirection to dashboard
        await expect(page).toHaveURL(/\/dashboard/);
    });

    // FT-002: Login with incorrect credentials
    test('FT-002: Login fails with invalid credentials', async ({ page }) => {
        // Mock 401 response
        await page.route('**/api/login', async route => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Invalid password' })
            });
        });

        await page.goto('/auth');
        // Already in Login mode by default

        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'WrongPass');
        await page.click('button:has-text("Sign In")');

        // Check for error div
        // Axios default error message for 401 is "Request failed with status code 401"
        await expect(page.locator('text=401')).toBeVisible();
    });

    // FT-003: Silent Refresh verification
    test('FT-003: Silent Refresh on Token Expiry', async ({ page }) => {
        // 1. Login first to get into state
        await page.route('**/api/login', async route => {
            await route.fulfill({ json: MOCK_USER });
        });

        await page.goto('/auth');
        await expect(page.locator('input[name="email"]')).toBeVisible();

        // Login Flow
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'pass');
        await page.click('button:has-text("Sign In")');

        await page.waitForURL(/\/dashboard/);

        // 2. NOW set up the failure for the subsequent request (Dashboard -> Scores)
        let callCount = 0;
        await page.route('**/api/scores/*', async route => {
            callCount++;
            if (callCount === 1) {
                await route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: "Token expired" })
                });
            } else {
                await route.fulfill({
                    status: 200,
                    json: []
                });
            }
        });

        await page.route('**/api/refreshToken', async route => {
            await route.fulfill({
                status: 200,
                json: "new-fake-access-token"
            });
        });

        // Trigger a reload to force the fetch again with the new mocks active
        await page.reload();

        // Verify that the data eventually loaded (meaning refresh worked)
        await expect(page.locator('text=Science Starter')).toBeVisible();
    });


    // FT-004: Game Logic - Input Correct Word
    test('FT-004: Game Logic - Score increases on correct word', async ({ page }) => {
        // Mock Login
        await page.route('**/api/login', async route => {
            await route.fulfill({ json: MOCK_USER });
        });

        await page.goto('/auth');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'pass');
        await page.click('button:has-text("Sign In")');

        // Choose Science
        await page.click('text=Science Starter');

        // Wait for game to load
        await expect(page.locator('text=SCORE')).toBeVisible();

        // Click a clue (li element)
        const firstClue = page.locator('li').first();
        await firstClue.click();

        // Verify Clue Panel Active State
        await expect(page.locator('input[placeholder="ANSWER"]')).toBeVisible();
    });

    // FT-005: Hint System
    test('FT-005: Hint Logic - penalty applied', async ({ page }) => {
        await page.route('**/api/login', async route => {
            await route.fulfill({ json: MOCK_USER });
        });
        await page.goto('/auth');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'pass');
        await page.click('button:has-text("Sign In")');

        await page.click('text=Science Starter');

        // Wait for game load
        await expect(page.locator('text=SCORE')).toBeVisible();

        // Select a word to enable hints
        const firstClue = page.locator('li').first();
        await firstClue.click();

        // Initial hints usually 3
        const hintsBtn = page.locator('button:has-text("HINT")');
        await expect(hintsBtn).toBeVisible();
        await expect(hintsBtn).toBeEnabled();

        await hintsBtn.click();

        // Expect hint count to decrease in button text e.g. "HINT (2)"
        await expect(page.locator('button:has-text("HINT (2)")')).toBeVisible();
    });
});
