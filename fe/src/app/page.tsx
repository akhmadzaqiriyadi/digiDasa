'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { getSchoolKnowledge } from '@/lib/api/knowledge';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  ShieldCheck,
  Zap,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { JurusanItem, FaqItem } from '@/lib/schemas';

export default function PublicLandingPage() {
  const { data: knowledgeResponse, isLoading } = useQuery({
    queryKey: queryKeys.knowledge.detail(),
    queryFn: getSchoolKnowledge,
  });

  const kData = knowledgeResponse?.data;
  const jurusans = kData?.jurusans || [];
  const faqs = kData?.faq_populer || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-orange-500/[0.04] via-background to-background py-10 sm:py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto mb-8">
              <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 gap-1.5 py-1 px-3 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                DIGIForward 2026–2027 • Inovasi Vokasi Nasional
              </Badge>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
                Asisten Informasi Digital Sekolah &amp; Layanan PPDB 24/7
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                Didukung <strong>Cognitive AI Google Gemini 2.5 Flash</strong> yang terintegrasi langsung dengan Surat Keputusan (SK) resmi SMK Negeri 1 Adiwerna (STM ADB). Konsultasi cepat, ramah, dan 100% bebas halusinasi.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="https://wa.me/6285292677431?text=Halo%20ADAPTIVA-BOT%2C%20saya%20ingin%20tanya%20info%20PPDB%20SMK%20Negeri%201%20Adiwerna"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-sm shadow-md">
                    <MessageSquare className="h-4 w-4" />
                    Chat WhatsApp Bot Sekarang
                  </Button>
                </a>

                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="gap-2 text-sm font-semibold border-border">
                    Buka Dashboard Admin
                    <ArrowRight className="h-4 w-4 text-orange-500" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Hero Banner Container */}
            <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden border border-border/80 shadow-2xl bg-card">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src="/assets/hero_banner.jpg"
                  alt="ADAPTIVA-BOT SMK Negeri 1 Adiwerna Hero Banner"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Key Value Propositions */}
        <section className="py-12 sm:py-16 border-b border-border/40 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 mb-2">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold">100% Grounded SK Resmi</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Jawaban AI bersumber langsung dari SK Panitia SPMB 2026/2027 dan database kurikulum resmi sekolah.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2">
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold">Respons Cepat &lt; 1 Detik</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Kombinasi Google Gemini 2.5 Flash dengan Local Fallback Engine menjamin layanan aktif tanpa antre 24/7.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold">9 Jurusan Vokasi Unggulan</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Informasi lengkap kurikulum, kuota penerimaan, fasilitas bengkel TEFA, dan peluang karir industri lulusan.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* 3. 9 Jurusan Kejuruan Section */}
        <section className="py-14 sm:py-20 border-b border-border/40">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs">
                Konsentrasi Keahlian
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                9 Program Jurusan SMK Negeri 1 Adiwerna
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Pilih bidang keahlian vokasi masa depan dengan akreditasi Unggul dan sertifikasi industri
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jurusans.map((j: JurusanItem) => (
                  <Card key={j.kode} className="border-border/80 shadow-sm hover:border-orange-500/40 transition flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5">
                          {j.kode}
                        </Badge>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Akreditasi {j.akreditasi}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold mt-3">
                        {j.nama}
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed line-clamp-3 mt-1">
                        {j.deskripsi}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 text-xs space-y-3">
                      {j.keunggulan && j.keunggulan.length > 0 && (
                        <div className="border-t border-border/50 pt-2.5">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">
                            Keunggulan TEFA:
                          </span>
                          <ul className="text-[11px] text-muted-foreground mt-1 space-y-0.5">
                            {j.keunggulan.slice(0, 2).map((k: string, idx: number) => (
                              <li key={idx}>• {k}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 4. Live FAQ Section */}
        <section className="py-14 sm:py-20 bg-muted/20">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center space-y-2 mb-10">
              <Badge variant="outline" className="text-xs">
                Frequently Asked Questions
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Pertanyaan Seputar SPMB &amp; Sekolah
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Informasi cepat mengenai persyaratan, jalur pendaftaran, dan biaya seragam
              </p>
            </div>

            <Card className="border-border/80 shadow-sm">
              <CardContent className="p-6">
                {isLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <Accordion className="w-full">
                    {faqs.map((faq: FaqItem, idx: number) => (
                      <AccordionItem key={faq.id || idx} value={`faq-${idx}`}>
                        <AccordionTrigger className="text-xs sm:text-sm font-semibold text-left">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <p className="text-xs text-muted-foreground mb-3">
                Punya pertanyaan lain yang belum terjawab di sini?
              </p>
              <a
                href="https://wa.me/6285292677431"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2 text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Tanyakan Langsung ke WhatsApp Bot
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
