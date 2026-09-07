import React from 'react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40 py-10 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-orange-500/30">
                <Image
                  src="/assets/logo_smk.png"
                  alt="SMK Negeri 1 Adiwerna"
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-base">SMK Negeri 1 Adiwerna</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Jl. Raya II Po. Box 24 Adiwerna, Kabupaten Tegal, Jawa Tengah 52194.<br />
              Dikenal luas sebagai <strong>STM ADB</strong> — Sekolah Rujukan Vokasi Unggulan Nasional.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Layanan Sistem
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• Gateway WhatsApp AI 24 Jam Nonstop</li>
              <li>• Grounded Knowledge Base SPMB & 9 Konsentrasi Keahlian</li>
              <li>• Smart Human Escalation & Priority Ticketing</li>
              <li>• Full REST API dengan Scalar Interactive Docs</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Program DIGIForward 2026–2027
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dikembangkan oleh <strong>Tim Adaptiva SMK Negeri 1 Adiwerna</strong> dalam kemitraan strategis dengan <em>PT Generasi Edukator Indonesia (GenEd)</em>, <em>Cabang Dinas Pendidikan Wilayah XII Jateng</em>, dan <em>CTI Group</em>.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} ADAPTIVA-BOT. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Operasional Produksi Terverifikasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
