import { test, expect } from '@playwright/test';

test.describe('Dashboard Admin & Operasional', () => {
  test('harus menampilkan metric overview pada dashboard utama', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.locator('[data-slot="card-title"]').filter({ hasText: /^Gateway WhatsApp$/ })).toBeVisible();
    await expect(page.locator('[data-slot="card-title"]').filter({ hasText: /^Pesan Diproses$/ })).toBeVisible();
    await expect(page.locator('[data-slot="card-title"]').filter({ hasText: /^Latensi Rata-rata$/ })).toBeVisible();
    await expect(page.locator('[data-slot="card-title"]').filter({ hasText: /^Tiket Eskalasi$/ })).toBeVisible();
  });

  test('harus memiliki kontrol sesi WhatsApp termasuk tombol Keluar Sesi WA (Logout)', async ({ page }) => {
    await page.goto('/dashboard/whatsapp');

    // Verify WhatsApp management controls
    await expect(page.getByText(/Status & Sesi WhatsApp Gateway/i)).toBeVisible();

    // Verify "Keluar Sesi WA (Logout)" and "Putuskan Sambungan" exist
    await expect(page.getByRole('button', { name: /Keluar Sesi WA \(Logout\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Putuskan Sambungan/i })).toBeVisible();

    // Verify form uji pesan WhatsApp
    await expect(page.getByText(/Uji Coba Pengiriman Pesan/i)).toBeVisible();
    await expect(page.getByPlaceholder(/628123456789/i)).toBeVisible();
  });

  test('harus menampilkan tab kurikulum jurusan, FAQ, dan form tambah entitas', async ({ page }) => {
    await page.goto('/dashboard/knowledge');

    // Verify tabs
    await expect(page.getByRole('tab', { name: /Jurusan Unggulan/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /FAQ Populer/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Entitas Dinamis/i })).toBeVisible();

    // Verify Tambah Entitas button & dialog
    const tambahButton = page.getByRole('button', { name: /Tambah Entitas/i });
    await expect(tambahButton).toBeVisible();
    await tambahButton.click();

    await expect(page.getByRole('heading', { name: /Tambah Entitas Pengetahuan Baru/i })).toBeVisible();
    await expect(page.getByPlaceholder('Contoh: BEASISWA, TATA_TERTIB, SERAGAM')).toBeVisible();
  });

  test('harus memuat halaman manajemen tiket eskalasi dengan filter tabs', async ({ page }) => {
    await page.goto('/dashboard/tickets');

    await expect(page.getByRole('heading', { name: /Daftar Tiket Eskalasi Panitia/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Semua Tiket' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Menunggu Respons/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Terselesaikan/i })).toBeVisible();
  });
});
