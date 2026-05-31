import { downloadImage } from "./pixabay";

const IMAGE_SIZE = 1080;
const TITLE_MAX = 14;
const CONTENT_MAX = 20;

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function wrapText(text: string, max: number): string[] {
  const lines: string[] = [];
  let r = text;
  while (r.length > 0) {
    if (r.length <= max) { lines.push(r); break; }
    lines.push(r.slice(0, max));
    r = r.slice(max);
  }
  return lines;
}

export async function generateTextImage(imageUrl: string, title: string, content: string): Promise<Buffer> {
  const imgBuf = await downloadImage(imageUrl);
  const b64 = Buffer.from(imgBuf).toString("base64");
  const tLines = wrapText(title, TITLE_MAX);
  const cLines = wrapText(content, CONTENT_MAX);
  const tH = tLines.length * 67;
  const cH = cLines.length * 45;
  const startY = (IMAGE_SIZE - tH - 40 - cH) / 2;
  const titleSvg = tLines.map((l, i) => `<text x="540" y="${startY + 48 + i * 67}" font-family="sans-serif" font-size="48" font-weight="bold" fill="#fff" text-anchor="middle">${escapeXml(l)}</text>`).join("\n  ");
  const contentSvg = cLines.map((l, i) => `<text x="540" y="${startY + tH + 40 + 32 + i * 45}" font-family="sans-serif" font-size="32" fill="rgba(255,255,255,0.9)" text-anchor="middle">${escapeXml(l)}</text>`).join("\n  ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${IMAGE_SIZE}" height="${IMAGE_SIZE}"><g clip-path="url(#c)"><image href="data:image/jpeg;base64,${b64}" width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" preserveAspectRatio="xMidYMid slice"/></g><defs><clipPath id="c"><rect width="${IMAGE_SIZE}" height="${IMAGE_SIZE}"/></clipPath></defs><rect width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" fill="rgba(0,0,0,0.4)"/>${titleSvg}${contentSvg}</svg>`;
  return Buffer.from(svg, "utf-8");
}
