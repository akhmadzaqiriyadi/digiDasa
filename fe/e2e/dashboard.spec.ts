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

    // Verify Refresh button is always available
    await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();

    // Verify session control buttons exist according to connection state
    const isConnected = await page.getByText(/TERHUBUNG \(Online\)/i).isVisible();
    if (isConnected) {
      await expect(page.getByRole('button', { name: /Putuskan Sambungan/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Keluar Sesi WA \(Logout\)/i })).toBeVisible();
    } else {
      const actionControl = page.getByRole('button', { name: /(Mulai Sesi|Batalkan|Hubungkan Ulang|Reset Sesi)/i }).first();
      await expect(actionControl).toBeVisible();
    }

    // Verify form uji pesan WhatsApp
    await expect(page.getByText(/Uji Coba Pengiriman Pesan/i)).toBeVisible();
    await expect(page.getByPlaceholder(/628123456789/i)).toBeVisible();

    // Verify QR Code image is rendered when in SCAN_QR state
    const qrImg = page.locator('img[alt="WhatsApp QR Code"]');
    const waitingScan = page.getByText(/MENUNGGU SCAN QR/i).first();
    if (await waitingScan.isVisible()) {
      await expect(qrImg).toBeVisible();
    }
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

    // Close dialog
    await page.getByRole('button', { name: /Batal/i }).click();

    // Verify Search Bar and Pagination exist
    const searchInput = page.getByPlaceholder(/Cari program jurusan, materi keahlian/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Otomotif');
    await expect(page.getByText('TKR')).toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page.getByText(/Menampilkan/i).first()).toBeVisible();
  });

  test('harus memuat halaman manajemen tiket eskalasi dengan filter tabs, search, dan pagination', async ({ page }) => {
    await page.goto('/dashboard/tickets');

    await expect(page.getByRole('heading', { name: /Daftar Tiket Eskalasi Panitia/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Semua Tiket/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Menunggu Respons/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Terselesaikan/i })).toBeVisible();

    // Verify Search input
    const searchTicketInput = page.getByPlaceholder(/Cari ID tiket, nomor WhatsApp siswa/i);
    await expect(searchTicketInput).toBeVisible();
  });
});
