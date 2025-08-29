import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ScanHistoryEntry, DocumentGroup, ProcessingMode } from './geminiService';
import type { User } from './authService';

export function generateHistoryPdf(historyEntries: ScanHistoryEntry[]): void {
  if (historyEntries.length === 0) {
    alert('Nessun dato storico da esportare.');
    return;
  }

  const doc = new jsPDF();
  const title = "Report Storico Scansioni - scansioni.ch";
  const generationDate = `Generato il: ${new Date().toLocaleString('it-CH')}`;

  // Header
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(generationDate, 14, 30);

  const modeNames: { [key in ProcessingMode]?: string } = {
    quality: 'Chroma Scan',
    speed: 'Quick Scan',
    business: 'Batch Scan',
    book: 'Deep Scan',
    scontrino: 'Scontrino',
    'no-ai': 'Simple Scan'
  };

  // Table
  const tableColumn = ["Data e Ora", "Descrizione", "Modalità", "Variazione (SC)", "Stato"];
  const tableRows: (string | number)[][] = [];

  historyEntries.forEach(entry => {
    const isCredit = entry.amountInCoins > 0;
    const amountText = `${isCredit ? '+' : ''}${entry.amountInCoins}`;
    const entryData = [
      (entry.timestamp as any).toDate().toLocaleString('it-CH'),
      entry.description,
      entry.processingMode ? (modeNames[entry.processingMode] || entry.processingMode) : 'N/A',
      amountText,
      entry.status
    ];
    tableRows.push(entryData);
  });
  
  autoTable(doc, {
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
        fillColor: [158, 91, 254], // purple-500
        textColor: 255
    },
    styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 2,
    },
    columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 20 }
    },
    didParseCell: function (data) {
        if (data.column.dataKey === 4 && data.cell.section === 'body') { // Status column
            if (data.cell.raw === 'Success' || data.cell.raw === 'Credited') {
                data.cell.styles.textColor = '#16a34a'; // green
            }
            if (data.cell.raw === 'Error') {
                data.cell.styles.textColor = '#dc2626'; // red
            }
        }
        if (data.column.dataKey === 3 && data.cell.section === 'body') { // Amount column
            if (String(data.cell.raw).startsWith('+')) {
                data.cell.styles.textColor = '#16a34a'; // green
            }
        }
    }
  });

  // Footer (Page numbers)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Pagina ${i} di ${pageCount}`, doc.internal.pageSize.width / 2, 287, { align: 'center' });
  }

  // Save the PDF
  doc.save(`storico_scansioni_scansioni-ch_${new Date().toISOString().slice(0,10)}.pdf`);
}


export async function generateGroupPdf(group: DocumentGroup, appVersion: string): Promise<void> {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    const firstPage = group.pages[0];
    const keywords = [
        firstPage.uuid,
        firstPage.documentHash,
        group.category
    ].join(', ');
    
    doc.setProperties({
        title: group.title,
        subject: group.pages[0]?.analysis.riassunto || group.title,
        author: 'scansioni.ch User',
        keywords: keywords,
        creator: `scansioni.ch v${appVersion}`
    });


    const a4 = { width: 595.28, height: 841.89 };
    const margin = 20;

    for (let i = 0; i < group.pages.length; i++) {
        const page = group.pages[i];
        if (i > 0) {
            doc.addPage();
        }

        try {
            const img = new Image();
            img.src = page.processedImageDataUrl;
            await new Promise(resolve => img.onload = resolve);

            const imgRatio = img.naturalWidth / img.naturalHeight;
            const pageRatio = (a4.width - margin*2) / (a4.height - margin*2);

            let imgWidth, imgHeight;

            if (imgRatio > pageRatio) {
                imgWidth = a4.width - margin*2;
                imgHeight = imgWidth / imgRatio;
            } else {
                imgHeight = a4.height - margin*2;
                imgWidth = imgHeight * imgRatio;
            }

            const x = (a4.width - imgWidth) / 2;
            const y = (a4.height - imgHeight) / 2;
            
            doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);

        } catch (error) {
            console.error(`Impossibile aggiungere l'immagine per la pagina ${page.pageNumber} al PDF`, error);
            doc.text(`Errore nel caricamento dell'immagine per: ${page.sourceFileName}`, margin, margin);
        }
    }
    
    const pdfFileName = (group.title.replace(/[^a-z0-9\s-]/gi, '_').replace(/\s+/g, '_').trim() || `fascicolo_${group.id}`);
    doc.save(`${pdfFileName}.pdf`);
}

export async function generateLegalPdf(title: string, contentElement: HTMLElement, appVersion: string): Promise<void> {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    const pdfFileName = `${title.replace(/\s/g, '_')}_scansioni.ch_v${appVersion}.pdf`;

    doc.setProperties({
        title: `${title} - scansioni.ch v${appVersion}`,
        author: 'scansioni.ch',
        creator: `scansioni.ch v${appVersion}`
    });
    
    // Use the html method to convert the article content
    await doc.html(contentElement, {
        callback: function (doc) {
            // Add page numbers to all pages
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(`Pagina ${i} di ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 30, { align: 'center' });
                 doc.text(`scansioni.ch v${appVersion}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 30, { align: 'right' });
            }
            doc.save(pdfFileName);
        },
        margin: [40, 40, 40, 40],
        autoPaging: 'text',
        width: 515, // A4 width (595.28) - margins (40*2)
        windowWidth: contentElement.scrollWidth,
    });
}

export interface DisdettaData {
    recipientName: string;
    recipientAddress: string;
    contractDescription: string;
    contractNumber: string;
    effectiveDate: string;
    userName: string;
    userAddress: string;
}

export const generateDisdettaPdf = (data: DisdettaData): void => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const { recipientName, recipientAddress, contractDescription, contractNumber, effectiveDate, userName, userAddress } = data;
    const today = new Date().toLocaleDateString('it-CH');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);

    // Mittente (destra)
    doc.text(userAddress.split('\n'), 400, 80, { align: 'left' });
    
    // Destinatario (sinistra)
    doc.text(recipientAddress.split('\n'), 80, 160);

    // Data (destra)
    const city = userAddress.split('\n').pop()?.split(' ')[1] || 'Luogo';
    doc.text(`${city}, ${today}`, 400, 240);

    // Oggetto
    doc.setFont('helvetica', 'bold');
    doc.text(`Oggetto: Disdetta del contratto "${contractDescription}" (N. ${contractNumber || 'Non specificato'})`, 80, 300);

    // Corpo
    doc.setFont('helvetica', 'normal');
    const bodyText = `Spett.le ${recipientName},

con la presente, il/la sottoscritto/a ${userName}, comunica formalmente la propria volontà di recedere dal contratto in oggetto, stipulato con la Vostra società.

La disdetta è da intendersi valida a partire dalla prima data utile consentita dalle condizioni contrattuali, e comunque non oltre il ${new Date(effectiveDate).toLocaleDateString('it-CH')}.

Si prega di voler inviare una conferma scritta dell'avvenuta ricezione e accettazione della presente disdetta.

Distinti saluti,
`;
    
    const splitBody = doc.splitTextToSize(bodyText, 450);
    doc.text(splitBody, 80, 340);

    // Firma
    doc.text("Firma", 80, 550);
    doc.text("____________________", 80, 580);
    doc.text(`(${userName})`, 80, 595);

    doc.save(`Disdetta_${contractDescription.replace(/\s+/g, '_')}.pdf`);
};