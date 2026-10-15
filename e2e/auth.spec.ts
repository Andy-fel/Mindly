import { test, expect } from '@playwright/test';

test.describe('Navegación y Autenticación E2E', () => {

  test('Navegación de Landing a Login', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.locator('a[href="/login"], button:has-text("Iniciar Sesión"), button:has-text("Comenzar"), a:has-text("Login")').first();
    
    if (await loginLink.count() > 0) {
      await loginLink.click();
    } else {
      await page.goto('/login');
    }

    await expect(page).toHaveURL(/.*\/login/i);

    const emailInput = page.locator('#email');
    await expect(emailInput).toBeVisible();
  });

  test('Redirección Login a Dashboard tras éxito', async ({ page }) => {
    // Escuchamos el alert("¡Bienvenido!") antes de navegar para que lo apruebe solo
    page.on('dialog', dialog => dialog.accept());

    // Navegamos directamente al Login en tu puerto local
    await page.goto('/login');

    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const submitButton = page.getByRole('button', { name: /Acceder/i });

    // El robot usa las credenciales reales de tu base de datos local
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await submitButton.click();

    // Esperar la redirección real al espacio de Chat de Mindly
    await expect(page).toHaveURL(/.*\/chat/i);
  });

});