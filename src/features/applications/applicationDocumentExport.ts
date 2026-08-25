const exportPageAttribute = "data-application-export-page";

type ExportFormat = "docx" | "pdf";

type CapturedPage = {
  dataUrl: string;
  width: number;
  height: number;
};

function safeFileName(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "TIMGAS-application"
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function getExportPages(root: HTMLElement) {
  if (root.hasAttribute(exportPageAttribute)) return [root];
  const pages = Array.from(
    root.querySelectorAll<HTMLElement>(`[${exportPageAttribute}]`),
  );
  return pages.length ? pages : [root];
}

async function capturePages(root: HTMLElement): Promise<CapturedPage[]> {
  const { default: html2canvas } = await import("html2canvas");
  const pages = getExportPages(root);

  await document.fonts?.ready;
  await Promise.all(
    pages.flatMap((page) =>
      Array.from(page.querySelectorAll("img"), async (image) => {
        if (image.complete) return;
        try {
          await image.decode();
        } catch {
          // Continue with the available image state if decoding is unsupported.
        }
      }),
    ),
  );

  return Promise.all(
    pages.map(async (page) => {
      const canvas = await html2canvas(page, {
        backgroundColor: "#ffffff",
        logging: false,
        scale: 3,
        useCORS: true,
        windowWidth: Math.max(1_280, page.scrollWidth),
      });
      return {
        dataUrl: canvas.toDataURL("image/png"),
        width: canvas.width,
        height: canvas.height,
      };
    }),
  );
}

function fitWithin(
  sourceWidth: number,
  sourceHeight: number,
  maximumWidth: number,
  maximumHeight: number,
) {
  const scale = Math.min(
    maximumWidth / sourceWidth,
    maximumHeight / sourceHeight,
  );
  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

function dataUrlToUint8Array(dataUrl: string) {
  const encoded = dataUrl.split(",")[1] ?? "";
  const binary = window.atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function downloadPdf(pages: CapturedPage[], fileName: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    format: "letter",
    orientation: "portrait",
    unit: "pt",
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;

  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage("letter", "portrait");
    const fitted = fitWithin(
      page.width,
      page.height,
      pageWidth - margin * 2,
      pageHeight - margin * 2,
    );
    pdf.addImage(
      page.dataUrl,
      "PNG",
      (pageWidth - fitted.width) / 2,
      margin,
      fitted.width,
      fitted.height,
      undefined,
      "SLOW",
    );
  });

  pdf.save(`${safeFileName(fileName)}.pdf`);
}

async function downloadDocx(pages: CapturedPage[], fileName: string) {
  const { Document, ImageRun, Packer, PageBreak, Paragraph } =
    await import("docx");
  const maximumWidth = 720;
  const maximumHeight = 960;
  const children = pages.flatMap((page, index) => {
    const fitted = fitWithin(
      page.width,
      page.height,
      maximumWidth,
      maximumHeight,
    );
    const paragraph = new Paragraph({
      alignment: "center",
      spacing: { after: 0, before: 0 },
      children: [
        new ImageRun({
          data: dataUrlToUint8Array(page.dataUrl),
          transformation: {
            width: Math.round(fitted.width),
            height: Math.round(fitted.height),
          },
          type: "png",
        }),
      ],
    });
    return index < pages.length - 1
      ? [paragraph, new Paragraph({ children: [new PageBreak()] })]
      : [paragraph];
  });
  const documentFile = new Document({
    creator: "TIMGAS MPC",
    description: "Official TIMGAS MPC application record",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 360, right: 360, bottom: 360, left: 360 },
            size: { width: 12_240, height: 15_840 },
          },
        },
        children,
      },
    ],
    title: safeFileName(fileName),
  });
  downloadBlob(
    await Packer.toBlob(documentFile),
    `${safeFileName(fileName)}.docx`,
  );
}

export async function downloadApplicationDocument(
  root: HTMLElement,
  fileName: string,
  format: ExportFormat,
) {
  const pages = await capturePages(root);
  if (format === "pdf") {
    await downloadPdf(pages, fileName);
    return;
  }
  await downloadDocx(pages, fileName);
}

async function waitForPrintAssets(frameDocument: Document) {
  await frameDocument.fonts?.ready;
  await Promise.all(
    Array.from(frameDocument.images, (image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

export async function printApplicationDocument(
  root: HTMLElement,
  title: string,
) {
  const pages = await capturePages(root);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.border = "0";
  frame.style.opacity = "0";
  document.body.append(frame);

  const frameDocument = frame.contentDocument;
  if (!frameDocument) {
    frame.remove();
    throw new Error("The print document could not be prepared.");
  }

  const pageImages = pages
    .map(
      (page, index) =>
        `<section class="application-page"><img src="${page.dataUrl}" alt="Application page ${index + 1}"></section>`,
    )
    .join("");
  frameDocument.open();
  frameDocument.write(`<!doctype html>
    <html>
      <head>
        <base href="${document.baseURI}">
        <title>${title.replace(/[<>&]/g, "")}</title>
        <style>
          @page { size: Letter portrait; margin: .3in; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .application-print { display: block !important; }
          .application-page {
            box-sizing: border-box !important;
            display: flex;
            width: 7.9in;
            min-height: 10.35in;
            margin: 0 auto !important;
            align-items: flex-start;
            justify-content: center;
            break-after: page;
            page-break-after: always;
          }
          .application-page img {
            display: block;
            width: 100%;
            height: auto;
            max-height: 10.35in;
            object-fit: contain;
            object-position: top center;
          }
          .application-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
        </style>
      </head>
      <body><main class="application-print">${pageImages}</main></body>
    </html>`);
  frameDocument.close();

  await waitForPrintAssets(frameDocument);
  const printWindow = frame.contentWindow;
  if (!printWindow) {
    frame.remove();
    throw new Error("The print window could not be opened.");
  }
  printWindow.focus();
  printWindow.print();
  window.setTimeout(() => frame.remove(), 60_000);
}
