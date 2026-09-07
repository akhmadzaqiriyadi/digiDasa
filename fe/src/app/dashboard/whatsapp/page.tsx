'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useWhatsAppStatus,
  useConnectWhatsApp,
  useDisconnectWhatsApp,
  useLogoutWhatsApp,
  useSendTestWhatsAppMessage
} from '@/hooks/use-whatsapp';
import { SendTestMessageSchema, SendTestMessageInput } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  MessageSquare,
  QrCode,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Zap,
  LogOut,
  PowerOff
} from 'lucide-react';

export default function WhatsAppDashboardPage() {
  const {
    data: waResponse,
    isLoading,
    isRefetching,
    refetch
  } = useWhatsAppStatus(3000);

  const connectMutation = useConnectWhatsApp();
  const disconnectMutation = useDisconnectWhatsApp();
  const logoutMutation = useLogoutWhatsApp();
  const sendTestMutation = useSendTestWhatsAppMessage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SendTestMessageInput>({
    resolver: zodResolver(SendTestMessageSchema),
    defaultValues: {
      targetNumber: '',
      text: 'Halo! Ini pesan pengujian koneksi dari ADAPTIVA-BOT SMK Negeri 1 Adiwerna.'
    }
  });

  const status = waResponse?.data.status || 'UNKNOWN';
  const isConnected = Boolean(waResponse?.data.ready || waResponse?.data.isReady || status === 'CONNECTED' || status === 'READY');
  const qrString = waResponse?.data.qr;
  const qrDataUrl = waResponse?.data.qrDataUrl;
  const pairingCode = waResponse?.data.pairingCode;
  const hasQr = Boolean(qrDataUrl || qrString);
  const isScanQr = (status === 'SCAN_QR' || hasQr) && !isConnected;
  const isInitializing = status === 'INITIALIZING' && !isConnected;
  const isError = status === 'ERROR' && !isConnected;
  const isDisconnected = !isConnected && !isScanQr && !isInitializing && !isError;

  const onSubmit = (data: SendTestMessageInput) => {
    sendTestMutation.mutate(data, {
      onSuccess: () => reset()
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Header */}
      <Alert className="border-orange-500/20 bg-orange-500/5">
        <Smartphone className="h-4 w-4 text-orange-500" />
        <AlertTitle className="text-xs font-semibold text-orange-600 dark:text-orange-400">
          WhatsApp Web Gateway v5.2 • SMK Negeri 1 Adiwerna
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-0.5">
          Gateway ini menghubungkan nomor resmi panitia sekolah dengan Cognitive AI Gemini. Sesi tersimpan secara persisten dengan LocalAuth.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code & Connection Status */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-orange-500" />
                    Status &amp; Sesi WhatsApp Gateway
                  </CardTitle>
                  {isConnected ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      TERHUBUNG (Online)
                    </Badge>
                  ) : isScanQr ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 text-[11px] gap-1 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      MENUNGGU SCAN QR
                    </Badge>
                  ) : isInitializing ? (
                    <Badge variant="outline" className="border-blue-500 text-blue-600 text-[11px] gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      MENYIAPKAN BROWSER...
                    </Badge>
                  ) : isError ? (
                    <Badge variant="destructive" className="text-[11px] gap-1">
                      <AlertCircle className="h-3 w-3" />
                      KENDALA SESI (ERROR)
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[11px] gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      OFFLINE / TERPUTUS
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-1">
                  {isConnected
                    ? 'Sesi WhatsApp aktif melayani pertanyaan calon siswa secara otomatis 24 jam nonstop.'
                    : isScanQr
                    ? 'Scan QR code di bawah menggunakan aplikasi WhatsApp di HP panitia SPMB.'
                    : isInitializing
                    ? 'Browser headless Puppeteer sedang dinyalakan untuk membuat sesi login baru.'
                    : isError
                    ? 'Terjadi kendala pada koneksi browser WhatsApp. Silakan hubungkan ulang atau reset sesi.'
                    : 'Klien WhatsApp belum aktif. Klik Mulai Sesi untuk menghasilkan QR Code login.'}
                </CardDescription>
              </div>

              {/* Action Buttons Decision Tree */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="text-xs gap-1 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                {/* 1. STATE: TERHUBUNG (CONNECTED) -> Tampilkan Putuskan & Logout */}
                {isConnected && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md font-medium text-xs h-8 px-2.5 border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 gap-1 cursor-pointer">
                        <PowerOff className="h-3 w-3" />
                        Putuskan Sambungan
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Putuskan Sambungan WhatsApp?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Klien browser WhatsApp akan ditutup sementara. Sesi login tetap tersimpan di database dan dapat dihubungkan kembali tanpa scan QR ulang.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => disconnectMutation.mutate()}
                            className="bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                          >
                            Ya, Putuskan
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md font-medium text-xs h-8 px-2.5 bg-destructive hover:bg-destructive/90 text-white gap-1 cursor-pointer">
                        <LogOut className="h-3 w-3" />
                        Keluar Sesi WA (Logout)
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Konfirmasi Keluar Sesi (Logout)</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin keluar dari sesi WhatsApp ini? File session LocalAuth akan dibersihkan dan Anda perlu melakukan scan QR ulang.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => logoutMutation.mutate()}
                            className="bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                          >
                            Ya, Keluar Sesi
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

                {/* 2. STATE: MENUNGGU SCAN QR -> Tampilkan Batalkan Scan (bukan Putuskan Sambungan) */}
                {isScanQr && (
                  <AlertDialog>
                    <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md font-medium text-xs h-8 px-2.5 border border-destructive/30 text-destructive hover:bg-destructive/10 gap-1 cursor-pointer">
                      <PowerOff className="h-3 w-3" />
                      Batalkan Scan QR
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Batalkan Scan QR Code?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Proses pembuatan sesi akan dihentikan dan tampilan QR code akan ditutup.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => disconnectMutation.mutate()}
                          className="bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                        >
                          Ya, Batalkan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* 3. STATE: INITIALIZING -> Tombol Batal */}
                {isInitializing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                    className="text-xs text-muted-foreground hover:text-destructive gap-1 cursor-pointer"
                  >
                    <PowerOff className="h-3 w-3" />
                    Batalkan
                  </Button>
                )}

                {/* 4. STATE: OFFLINE / DISCONNECTED -> Tombol Mulai Sesi & Reset Cache */}
                {isDisconnected && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => connectMutation.mutate()}
                      disabled={connectMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1.5 cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {connectMutation.isPending ? 'Menyiapkan...' : 'Mulai Sesi WhatsApp'}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md font-medium text-xs h-8 px-2.5 border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1 cursor-pointer">
                        <LogOut className="h-3 w-3" />
                        Reset Sesi WA
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Cache Sesi WhatsApp?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan membersihkan sisa session LocalAuth untuk memastikan inisialisasi sesi baru benar-benar bersih.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => logoutMutation.mutate()}
                            className="bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                          >
                            Ya, Bersihkan
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

                {/* 5. STATE: ERROR -> Tombol Hubungkan Ulang & Reset */}
                {isError && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => connectMutation.mutate()}
                      disabled={connectMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1.5 cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {connectMutation.isPending ? 'Mencoba...' : 'Hubungkan Ulang'}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md font-medium text-xs h-8 px-2.5 bg-destructive hover:bg-destructive/90 text-white gap-1 cursor-pointer">
                        <LogOut className="h-3 w-3" />
                        Reset Sesi (Logout)
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Sesi LocalAuth?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Membersihkan file session LocalAuth yang rusak agar QR code dapat digenerate kembali.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => logoutMutation.mutate()}
                            className="bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                          >
                            Ya, Reset Sesi
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-3 py-10">
                  <Skeleton className="h-48 w-48 rounded-xl" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : isConnected ? (
                <div className="flex flex-col items-center text-center py-8 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {waResponse?.data.user?.name || 'ADAPTIVA-BOT'} Terhubung
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Nomor resmi panitia SPMB aktif melayani konsultasi pendaftar 24 jam nonstop.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge className="bg-emerald-600 text-white text-xs px-3 py-1">
                      SESI TEROTENTIKASI (LocalAuth)
                    </Badge>
                  </div>

                  {/* Tombol Keluar Sesi WA */}
                  <div className="pt-2">
                    <AlertDialog>
                      <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md font-medium text-xs h-8 px-3 bg-destructive hover:bg-destructive/90 text-white gap-1.5 cursor-pointer">
                        <LogOut className="h-3.5 w-3.5" />
                        Keluar Sesi WA (Logout)
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Konfirmasi Keluar Sesi</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sesi WhatsApp akan diputuskan dan auth session lokal akan dibersihkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => logoutMutation.mutate()}
                            className="bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                          >
                            Ya, Keluar Sesi
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : hasQr ? (
                <div className="flex flex-col items-center text-center space-y-4 py-2">
                  <div className="p-4 bg-white rounded-2xl shadow-md border border-border">
                    {qrDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={qrDataUrl}
                        alt="WhatsApp QR Code"
                        className="w-[220px] h-[220px] object-contain rounded-lg"
                      />
                    ) : qrString ? (
                      <QRCodeSVG
                        value={qrString}
                        size={220}
                        level="M"
                        includeMargin
                      />
                    ) : null}
                  </div>
                  <div>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                      MENUNGGU SCAN QR
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
                      Buka WhatsApp di HP panitia &gt; <strong>Perangkat Tertaut</strong> &gt; <strong>Tautkan Perangkat</strong>, lalu scan kode QR di atas.
                    </p>
                  </div>
                </div>
              ) : status === 'INITIALIZING' || connectMutation.isPending ? (
                <div className="flex flex-col items-center text-center py-10 space-y-3">
                  <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Menyiapkan Sesi &amp; QR Code...
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Sedang menginisialisasi browser Chromium headless. QR Code akan muncul dalam beberapa detik...
                    </p>
                  </div>
                </div>
              ) : status === 'ERROR' ? (
                <div className="flex flex-col items-center text-center py-8 space-y-3">
                  <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
                    <AlertCircle className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-red-600 dark:text-red-400">
                      Kendala Inisialisasi Sesi
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Browser headless sempat terkunci atau sesi terputus. Klik tombol di bawah untuk mereset dan memuat ulang sesi WhatsApp.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <Button
                      onClick={() => connectMutation.mutate()}
                      disabled={connectMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {connectMutation.isPending ? 'Mereset & Memulai...' : 'Hubungkan Ulang (Reconnect)'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md font-medium text-xs h-8 px-3 border border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer">
                        <LogOut className="h-3.5 w-3.5" />
                        Reset Auth Folder
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Auth Folder?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus folder session lokal dan membersihkan status login.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => logoutMutation.mutate()}
                            className="bg-destructive hover:bg-destructive/90 text-white cursor-pointer"
                          >
                            Ya, Bersihkan
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-8 space-y-3">
                  <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <AlertCircle className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Sesi Belum Dimulai
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Klik tombol di bawah untuk menginisialisasi browser headless dan menghasilkan QR Code baru.
                    </p>
                  </div>
                  <Button
                    onClick={() => connectMutation.mutate()}
                    disabled={connectMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-xs"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {connectMutation.isPending ? 'Menginisialisasi...' : 'Inisialisasi Sesi WhatsApp'}
                  </Button>
                </div>
              )}

              {pairingCode && (
                <div className="p-3 bg-muted rounded-lg text-center w-full max-w-xs">
                  <span className="text-[11px] text-muted-foreground">Kode Pairing:</span>
                  <p className="text-base font-mono font-bold tracking-widest text-foreground">
                    {pairingCode}
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-muted/30 border-t border-border/60 text-[11px] text-muted-foreground flex justify-between">
              <span className="flex items-center gap-1.5">
                Status Terkini:{' '}
                <Badge
                  variant={
                    isConnected
                      ? 'default'
                      : status === 'SCAN_QR'
                      ? 'outline'
                      : status === 'ERROR'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className={`text-[10px] uppercase font-bold ${
                    isConnected ? 'bg-emerald-600 text-white' : ''
                  }`}
                >
                  {status}
                </Badge>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Anti-Ban Protection Active
              </span>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Send Test Message Form via React Hook Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Send className="h-4 w-4 text-orange-500" />
                Uji Coba Pengiriman Pesan
              </CardTitle>
              <CardDescription className="text-xs">
                Kirim pesan uji coba ke nomor WhatsApp Anda untuk memverifikasi jalur gateway
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Nomor WhatsApp Tujuan
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: 628123456789 atau 08123456789"
                    {...register('targetNumber')}
                    className="text-xs"
                  />
                  {errors.targetNumber && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.targetNumber.message}
                    </p>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    Format nomor dapat menggunakan awalan 08... atau 628...
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Isi Pesan Teks
                  </label>
                  <Textarea
                    rows={4}
                    placeholder="Tuliskan pesan..."
                    {...register('text')}
                    className="text-xs resize-none"
                  />
                  {errors.text && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.text.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/60 pt-4 flex justify-between">
                <Button
                  type="submit"
                  disabled={sendTestMutation.isPending || !isConnected}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {sendTestMutation.isPending ? 'Mengirim...' : 'Kirim Pesan Uji Coba'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
