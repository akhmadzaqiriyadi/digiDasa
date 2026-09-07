'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { getWhatsAppStatus, connectWhatsApp, sendTestWhatsAppMessage } from '@/lib/api/whatsapp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import {
  MessageSquare,
  QrCode,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function WhatsAppDashboardPage() {
  const queryClient = useQueryClient();
  const [targetNumber, setTargetNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Halo! Ini pesan pengujian koneksi dari ADAPTIVA-BOT SMK Negeri 1 Adiwerna.');

  const {
    data: waResponse,
    isLoading,
    isRefetching,
    refetch
  } = useQuery({
    queryKey: queryKeys.whatsapp.status(),
    queryFn: getWhatsAppStatus,
    refetchInterval: 3000, // Poll every 3 seconds for QR updates
  });

  const connectMutation = useMutation({
    mutationFn: connectWhatsApp,
    onSuccess: (data) => {
      toast.success(data.message || 'Inisialisasi koneksi WhatsApp berhasil.');
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.all });
    },
    onError: (err: Error) => {
      toast.error(`Gagal menghubungkan: ${err.message}`);
    }
  });

  const sendTestMutation = useMutation({
    mutationFn: sendTestWhatsAppMessage,
    onSuccess: (data) => {
      toast.success(data.message || 'Pesan uji coba berhasil dikirim!');
    },
    onError: (err: Error) => {
      toast.error(`Gagal mengirim pesan: ${err.message}`);
    }
  });

  const status = waResponse?.data.status || 'UNKNOWN';
  const isConnected = waResponse?.data.ready || status === 'CONNECTED' || status === 'READY';
  const qrString = waResponse?.data.qr;
  const pairingCode = waResponse?.data.pairingCode;

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetNumber.trim()) {
      toast.warning('Silakan masukkan nomor telepon tujuan!');
      return;
    }
    if (!testMessage.trim()) {
      toast.warning('Silakan tuliskan isi pesan uji coba!');
      return;
    }
    sendTestMutation.mutate({
      targetNumber,
      text: testMessage
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-orange-500" />
                  Status Sesi & Autentikasi
                </CardTitle>
                <CardDescription className="text-xs">
                  Scan QR code menggunakan aplikasi WhatsApp di HP panitia
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="text-xs gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-3 py-10">
                  <Skeleton className="h-48 w-48 rounded-xl" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : isConnected ? (
                <div className="flex flex-col items-center text-center py-8 space-y-3">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      WhatsApp Gateway Terhubung & Siap
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Nomor resmi panitia SPMB aktif melayani konsultasi pendaftar 24 jam nonstop.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge className="bg-emerald-600 text-white text-xs px-3 py-1">
                      SESI TEROTENTIKASI (LocalAuth)
                    </Badge>
                  </div>
                </div>
              ) : qrString ? (
                <div className="flex flex-col items-center text-center space-y-4 py-2">
                  <div className="p-4 bg-white rounded-2xl shadow-md border border-border">
                    <QRCodeSVG
                      value={qrString}
                      size={220}
                      level="M"
                      includeMargin
                    />
                  </div>
                  <div>
                    <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 text-xs">
                      MENUNGGU SCAN QR
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                      Buka <strong>WhatsApp &gt; Perangkat Tertaut &gt; Tautkan Perangkat</strong>, lalu arahkan kamera ke kode di atas.
                    </p>
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
              <span>Status Terkini: <strong>{status}</strong></span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Anti-Ban Protection Active
              </span>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Send Test Message Form */}
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

            <form onSubmit={handleSendTest}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Nomor WhatsApp Tujuan
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: 628123456789 atau 08123456789"
                    value={targetNumber}
                    onChange={(e) => setTargetNumber(e.target.value)}
                    className="text-xs"
                  />
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
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="text-xs resize-none"
                  />
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
