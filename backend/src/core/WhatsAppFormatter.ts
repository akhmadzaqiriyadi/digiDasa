/**
 * Utility untuk memformat teks Markdown standar (dari LLM / Gemini)
 * menjadi format pesan WhatsApp yang rapi, elegan, dan terbaca sempurna.
 */
export class WhatsAppFormatter {
  public static format(text: string): string {
    if (!text) return '';

    let formatted = text;

    // 1. Ganti double asterisks (**bold**) menjadi single asterisk (*bold*) khas WhatsApp
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '*$1*');

    // 2. Bersihkan bullet point markdown '* ' atau '- ' menjadi simbol bullet elegan '• '
    // Menghindari konflik antara bullet asterisk dengan bold asterisk di WhatsApp
    formatted = formatted.replace(/^[ \t]*\*[ \t]+/gm, '• ');
    formatted = formatted.replace(/^[ \t]*-[ \t]+/gm, '• ');

    // 3. Bersihkan spasi ganda yang tidak rapi
    formatted = formatted.replace(/[ \t]+\n/g, '\n');

    // 4. Pastikan baris kosong berurutan maksimal 2 baris
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  }
}
