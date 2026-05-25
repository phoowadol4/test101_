/**
 * ส่งออกแบบฟอร์มเป็น PDF จาก DOM ของ HomeVisitPrintTemplate
 */
function waitForFonts() {
  if (document.fonts?.ready) {
    return document.fonts.ready;
  }
  return Promise.resolve();
}

function fitImageToPage(pdf, imgData, imgWidth, imgHeight, pageWidth, pageHeight) {
  let w = pageWidth;
  let h = (imgHeight * w) / imgWidth;
  if (h > pageHeight) {
    h = pageHeight;
    w = (imgWidth * h) / imgHeight;
  }
  const x = (pageWidth - w) / 2;
  const y = 0;
  pdf.addImage(imgData, 'PNG', x, y, w, h);
}

export async function exportHomeVisitPdf(element, filename = 'home-visit-form.pdf') {
  if (!element) throw new Error('ไม่พบเนื้อหาสำหรับส่งออก PDF');

  const prevStyle = {
    position: element.style.position,
    left: element.style.left,
    top: element.style.top,
    zIndex: element.style.zIndex,
    visibility: element.style.visibility,
    pointerEvents: element.style.pointerEvents,
    opacity: element.style.opacity,
  };

  Object.assign(element.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    zIndex: '9999',
    visibility: 'visible',
    pointerEvents: 'none',
    opacity: '1',
  });

  await waitForFonts();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const pages = element.querySelectorAll('[data-pdf-page]');
    const targets = pages.length ? [...pages] : [element];

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: target.offsetWidth,
        height: target.offsetHeight,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      if (i > 0) pdf.addPage();
      fitImageToPage(pdf, imgData, canvas.width, canvas.height, pageWidth, pageHeight);
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    console.warn('PDF library export failed, falling back to print', err);
    document.body.classList.add('home-visit-print-mode');
    window.print();
    document.body.classList.remove('home-visit-print-mode');
    return false;
  } finally {
    Object.assign(element.style, prevStyle);
  }
}
