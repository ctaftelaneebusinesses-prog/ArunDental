// Renders each child of `container` as one A4 page and downloads the result.
// The libraries are loaded on demand so they never weigh down the dashboard.
export async function downloadElementPagesAsPdf(container: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  const pages = Array.from(container.children) as HTMLElement[];
  for (let i = 0; i < pages.length; i += 1) {
    const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    // Fit the page inside the margins without distorting it.
    const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;
    if (i > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", (pageWidth - width) / 2, margin, width, height);
  }

  pdf.save(filename);
}
