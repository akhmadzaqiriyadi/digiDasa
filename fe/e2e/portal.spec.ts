import { test, expect } from '@playwright/test';

test.describe('Portal Publik & SPMB', () => {
  test('harus memuat halaman landing, hero banner, dan navbar tanpa link redundant', async ({ page }) => {
    await page.goto('/');

    // 1. Navbar checks: Verify "Dashboard Bot" is REMOVED
    const navbar = page.locator('header');
    await expect(navbar).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard Bot' })).toHaveCount(0);

    const nav = page.locator('nav');
    // Verify that the redundant dashboard tabs are removed from the public navbar
    await expect(nav.getByRole('link', { name: 'WhatsApp Gateway' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Knowledge Base' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Tiket Eskalasi' })).toHaveCount(0);

    // Verify correct public navbar links
    await expect(nav.getByRole('link', { name: 'Beranda' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Konsentrasi Keahlian' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'SPMB FAQ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pusat Kendali Bot' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chat WhatsApp Bot', exact: true })).toBeVisible();

    // 2. Hero Section checks
    await expect(page.getByRole('heading', { name: /Asisten Informasi Digital Sekolah/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Buka Dashboard Admin/i })).toBeVisible();
    const heroImage = page.locator('img[alt*="ADAPTIVA-BOT"]');
    await expect(heroImage).toBeVisible();

    // 3. Jurusan Kejuruan Section: Verify Jurusan cards render from knowledge data
    const jurusanHeading = page.getByRole('heading', { name: /Program Jurusan/i });
    await expect(jurusanHeading).toBeVisible();

    // Check that at least several key jurusans are rendered (e.g. DPIB, RPL, TITL, TKJ, TKR, TPM)
    await expect(page.locator('text=RPL').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=TKJ').first()).toBeVisible();
    await expect(page.locator('text=DPIB').first()).toBeVisible();

    // 4. FAQ Section: Verify accordion items render
    const faqHeading = page.getByRole('heading', { name: /Pertanyaan Seputar SPMB/i });
    await expect(faqHeading).toBeVisible();

    // Check for specific official FAQ questions
    const sppQuestion = page.locator('text=Apakah sekolah di SMK Negeri 1 Adiwerna ada SPP bulanan?').first();
    await expect(sppQuestion).toBeVisible();
  });
});
