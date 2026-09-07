declare module 'qrcode-terminal' {
  interface GenerateOptions {
    small?: boolean;
  }
  export function generate(input: string, opts?: GenerateOptions | ((qr: string) => void)): void;
}
