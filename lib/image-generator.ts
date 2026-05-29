import { downloadImage } from "./pixabay";

const IMAGE_SIZE = 1080;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let canvasModule: any = null;

async function getCanvas() {
  if (!canvasModule) {
    canvasModule = await import("canvas");
  }
  return canvasModule;
}

export async function generateTextImage(
  imageUrl: string,
  title: string,
  content: string
): Promise<Buffer> {
  const imageBuffer = await downloadImage(imageUrl);

  const { createCanvas, loadImage } = await getCanvas();
  const image = await loadImage(Buffer.from(imageBuffer));

  const canvas = createCanvas(IMAGE_SIZE, IMAGE_SIZE);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = canvas.getContext("2d") as any;

  const scale = Math.max(IMAGE_SIZE / image.width, IMAGE_SIZE / image.height);
  const x = (IMAGE_SIZE - image.width * scale) / 2;
  const y = (IMAGE_SIZE - image.height * scale) / 2;

  ctx.drawImage(image, x, y, image.width * scale, image.height * scale);

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  const titleFontSize = 48;
  ctx.font = `bold ${titleFontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;

  const maxWidth = IMAGE_SIZE - 120;
  const titleLines = wrapText(ctx, title, maxWidth);
  const lineHeight = titleFontSize * 1.4;
  const titleHeight = titleLines.length * lineHeight;

  const contentFontSize = 32;
  ctx.font = `${contentFontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  const contentLines = wrapText(ctx, content, maxWidth);
  const contentLineHeight = contentFontSize * 1.6;
  const contentHeight = contentLines.length * contentLineHeight;

  const totalHeight = titleHeight + 40 + contentHeight;
  let startY = (IMAGE_SIZE - totalHeight) / 2;

  ctx.font = `bold ${titleFontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  titleLines.forEach((line: string, i: number) => {
    ctx.fillText(line, IMAGE_SIZE / 2, startY + titleFontSize + i * lineHeight);
  });

  startY += titleHeight + 40;

  ctx.font = `${contentFontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.globalAlpha = 0.9;
  contentLines.forEach((line: string, i: number) => {
    ctx.fillText(
      line,
      IMAGE_SIZE / 2,
      startY + contentFontSize + i * contentLineHeight
    );
  });
  ctx.globalAlpha = 1;

  return canvas.toBuffer("image/jpeg", { quality: 0.95 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let currentLine = "";

  for (const char of text) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
