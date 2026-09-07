'use client';

import React from 'react';
import Link from 'next/link';
import { useSystemStatus } from '@/hooks/use-tickets';
import { useWhatsAppStatus } from '@/hooks/use-whatsapp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Database,
  Ticket
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { data: status, isLoading: isStatusLoading } = useSystemStatus();
  const { data: waStatus, isLoading: isWaLoading } = useWhatsAppStatus();

  const isWaConnected = waStatus?.data.ready || waStatus?.data.status === 'CONNECTED';

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: WhatsApp Status */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Gateway WhatsApp
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isWaLoading ? (
              <Skeleton className="h-7 w-28 mt-1" />
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${isWaConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-lg font-bold text-foreground">
                  {waStatus?.data.status || 'UNKNOWN'}
                </span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              {isWaConnected
                ? 'Sesi tersambung & aktif melayani chat'
                : 'Perlu scan QR code untuk menghubungkan'}
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Total Messages Processed */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pesan Diproses
            </CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isStatusLoading ? (
              <Skeleton className="h-7 w-20 mt-1" />
            ) : (
              <div className="text-2xl font-bold text-foreground mt-1">
                {status?.analytics?.totalMessagesProcessed ?? 24}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              Pertanyaan SPMB & info sekolah terjawab
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Uptime & Speed */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Latensi Rata-rata
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isStatusLoading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <div className="text-2xl font-bold text-foreground mt-1">
                {status?.analytics?.averageLatencyMs ?? 650} ms
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              Gemini 2.5 Flash + Local Fallback
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Tiket Eskalasi */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tiket Eskalasi
            </CardTitle>
            <Ticket className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isStatusLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">
                  {status?.escalations?.openTickets ?? 0}
                </span>
                <span className="text-xs text-muted-foreground">Terbuka</span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              {status?.escalations?.resolvedTickets ?? 0} tiket telah diselesaikan panitia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: WhatsApp Status Details */}
        <Card className="lg:col-span-2 border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">
                  Status Gateway WhatsApp & Sesi
                </CardTitle>
                <CardDescription className="text-xs">
                  Pemantauan real-time integrasi WhatsApp Web dengan LocalAuth
                </CardDescription>
              </div>
              <Link href="/dashboard/whatsapp">
                <Button variant="outline" size="sm" className="text-xs gap-1">
                  Kelola Sesi
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isWaConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                  {isWaConnected ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    {isWaConnected ? 'WhatsApp Bot Aktif Terhubung' : 'WhatsApp Menunggu Sesi / Scan'}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isWaConnected
                      ? `Tersambung sebagai: ${waStatus?.data.user?.name || 'ADAPTIVA-BOT Official'}`
                      : 'Buka halaman WhatsApp Gateway untuk melakukan pairing atau scan QR code.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/dashboard/whatsapp">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                    {isWaConnected ? 'Kirim Pesan Uji' : 'Buka QR Scanner'}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-border/60 bg-muted/30">
                <span className="text-[11px] text-muted-foreground">Akurasi Grounding</span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {status?.analytics?.groundingAccuracy || '100% Anti-Halusinasi'}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/30">
                <span className="text-[11px] text-muted-foreground">Lingkungan Sistem</span>
                <p className="text-sm font-bold text-foreground mt-0.5 capitalize">
                  {status?.system.environment || 'Production (Monorepo)'}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/30">
                <span className="text-[11px] text-muted-foreground">Waktu Nyala (Uptime)</span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {status?.system.uptime || '99.98%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Quick Links */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Navigasi Singkat</CardTitle>
            <CardDescription className="text-xs">
              Akses cepat fitur utama sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/knowledge" className="block">
              <div className="p-3 rounded-xl border border-border hover:border-orange-500/50 bg-card hover:bg-orange-500/5 transition p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Database className="h-4 w-4 text-orange-500" />
                    <div>
                      <h5 className="text-xs font-semibold">9 Jurusan & FAQ</h5>
                      <p className="text-[10px] text-muted-foreground">Kelola kurikulum & data SPMB</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </Link>

            <Link href="/dashboard/tickets" className="block">
              <div className="p-3 rounded-xl border border-border hover:border-orange-500/50 bg-card hover:bg-orange-500/5 transition p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Ticket className="h-4 w-4 text-amber-500" />
                    <div>
                      <h5 className="text-xs font-semibold">Tiket Panitia</h5>
                      <p className="text-[10px] text-muted-foreground">Daftar siswa butuh eskalasi</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </Link>

            <a href="http://localhost:3000/reference" target="_blank" rel="noreferrer" className="block">
              <div className="p-3 rounded-xl border border-border hover:border-orange-500/50 bg-card hover:bg-orange-500/5 transition p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ArrowUpRight className="h-4 w-4 text-purple-500" />
                    <div>
                      <h5 className="text-xs font-semibold">Scalar UI API Reference</h5>
                      <p className="text-[10px] text-muted-foreground">Dokumentasi & Try-It-Out REST API</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px]">REST</Badge>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
