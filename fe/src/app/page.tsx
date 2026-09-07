'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSchoolKnowledge } from '@/hooks/use-knowledge';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/common/pagination';
import {
  MessageSquare,
  ShieldCheck,
  Zap,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Search,
  X,
  Filter
} from 'lucide-react';
import { JurusanItem, FaqItem } from '@/lib/schemas';

export default function PublicLandingPage() {
  const { data: knowledgeResponse, isLoading } = useSchoolKnowledge();

  const [searchJurusan, setSearchJurusan] = useState('');
  const [jurusanPage, setJurusanPage] = useState(1);
  const JURUSAN_PER_PAGE = 6;

  const [searchFaq, setSearchFaq] = useState('');
  const [faqCategory, setFaqCategory] = useState('ALL');
  const [faqPage, setFaqPage] = useState(1);
  const FAQ_PER_PAGE = 5;

  const kData = knowledgeResponse?.data;
  const jurusans = useMemo(() => kData?.jurusans || [], [kData]);
  const faqs = useMemo(() => kData?.faq_populer || [], [kData]);

  const filteredJurusans = useMemo(() => {
    const q = searchJurusan.toLowerCase().trim();
    if (!q) return jurusans;
    return jurusans.filter((j) =>
      j.nama.toLowerCase().includes(q) ||
      j.kode.toLowerCase().includes(q) ||
      (j.deskripsi && j.deskripsi.toLowerCase().includes(q)) ||
      (j.peluang_karir && j.peluang_karir.some((p) => p.toLowerCase().includes(q)))
    );
  }, [jurusans, searchJurusan]);

  const totalJurusanPages = Math.ceil(filteredJurusans.length / JURUSAN_PER_PAGE) || 1;
  const paginatedJurusans = filteredJurusans.slice(
    (jurusanPage - 1) * JURUSAN_PER_PAGE,
    jurusanPage * JURUSAN_PER_PAGE
  );

  const faqCategories = useMemo(() => {
    const cats = new Set<string>();
    faqs.forEach((f) => {
      if (f.category) cats.add(f.category);
    });
    return Array.from(cats);
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const q = searchFaq.toLowerCase().trim();
    return faqs.filter((f) => {
      const matchCat = faqCategory === 'ALL' || f.category === faqCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    });
  }, [faqs, searchFaq, faqCategory]);

  const totalFaqPages = Math.ceil(filteredFaqs.length / FAQ_PER_PAGE) || 1;
  const paginatedFaqs = filteredFaqs.slice(
    (faqPage - 1) * FAQ_PER_PAGE,
    faqPage * FAQ_PER_PAGE
  );

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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
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
        <section id="jurusan" className="py-14 sm:py-20 border-b border-border/40 scroll-mt-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
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

            {/* Search Jurusan */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari jurusan (e.g. Mesin, Arsitektur, Otomotif, Listrik)..."
                  value={searchJurusan}
                  onChange={(e) => {
                    setSearchJurusan(e.target.value);
                    setJurusanPage(1);
                  }}
                  className="pl-10 pr-9 text-xs h-10 shadow-xs"
                />
                {searchJurusan && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchJurusan('');
                      setJurusanPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredJurusans.length === 0 ? (
              <Card className="border-dashed p-10 text-center text-muted-foreground max-w-md mx-auto">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-foreground">Jurusan Tidak Ditemukan</h4>
                <p className="text-xs mt-1">Tidak ada jurusan dengan kata kunci &ldquo;{searchJurusan}&rdquo;</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchJurusan('')}
                  className="mt-3 text-xs"
                >
                  Hapus Pencarian
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedJurusans.map((j: JurusanItem) => (
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

                      <CardContent className="pt-0 text-xs space-y-2.5">
                        {j.peluang_karir && j.peluang_karir.length > 0 && (
                          <div className="border-t border-border/50 pt-2.5">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground">
                              Prospek Karir Lulusan:
                            </span>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                              {j.peluang_karir.slice(0, 3).join(', ')}
                            </p>
                          </div>
                        )}
                        {j.kuota && (
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/30">
                            <span>Daya Tampung:</span>
                            <span className="font-semibold text-foreground">{j.kuota} Siswa</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Pagination
                  currentPage={jurusanPage}
                  totalPages={totalJurusanPages}
                  totalItems={filteredJurusans.length}
                  pageSize={JURUSAN_PER_PAGE}
                  onPageChange={setJurusanPage}
                  className="mt-6"
                />
              </>
            )}
          </div>
        </section>

        {/* 4. Live FAQ Section */}
        <section id="faq" className="py-14 sm:py-20 bg-muted/20 scroll-mt-16">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center space-y-2 mb-8">
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

            {/* FAQ Search & Category Filter */}
            <div className="space-y-3 mb-6">
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari pertanyaan FAQ (e.g. syarat, biaya, tanggal, tes)..."
                  value={searchFaq}
                  onChange={(e) => {
                    setSearchFaq(e.target.value);
                    setFaqPage(1);
                  }}
                  className="pl-10 pr-9 text-xs h-10 shadow-xs"
                />
                {searchFaq && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFaq('');
                      setFaqPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {faqCategories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1 flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Kategori:
                  </span>
                  <Badge
                    variant={faqCategory === 'ALL' ? 'default' : 'outline'}
                    className="cursor-pointer text-[11px]"
                    onClick={() => {
                      setFaqCategory('ALL');
                      setFaqPage(1);
                    }}
                  >
                    Semua ({faqs.length})
                  </Badge>
                  {faqCategories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={faqCategory === cat ? 'default' : 'outline'}
                      className="cursor-pointer text-[11px]"
                      onClick={() => {
                        setFaqCategory(cat);
                        setFaqPage(1);
                      }}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Card className="border-border/80 shadow-sm">
              <CardContent className="p-6">
                {isLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : filteredFaqs.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-foreground">FAQ Tidak Ditemukan</p>
                    <p className="text-xs mt-1">Tidak ada pertanyaan dengan kata kunci &ldquo;{searchFaq}&rdquo;</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchFaq('');
                        setFaqCategory('ALL');
                        setFaqPage(1);
                      }}
                      className="mt-3 text-xs"
                    >
                      Reset Pencarian
                    </Button>
                  </div>
                ) : (
                  <>
                    <Accordion className="w-full">
                      {paginatedFaqs.map((faq: FaqItem, idx: number) => (
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

                    <Pagination
                      currentPage={faqPage}
                      totalPages={totalFaqPages}
                      totalItems={filteredFaqs.length}
                      pageSize={FAQ_PER_PAGE}
                      onPageChange={setFaqPage}
                      className="mt-4"
                    />
                  </>
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
