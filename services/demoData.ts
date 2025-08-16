import type { ProcessedPageResult, ProcessingMode } from './geminiService';

// Helper function to generate a simple demo logo as a data URL
const generateDemoLogo = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Simple shield logo inspired by insurance company logos
    ctx.fillStyle = '#61f5fe'; // A color similar to polizze.ch
    ctx.beginPath();
    ctx.moveTo(32, 5); // Top center
    ctx.lineTo(59, 20); // Top right
    ctx.lineTo(59, 44); // Bottom right
    ctx.arcTo(32, 59, 5, 44, 20); // Bottom curve
    ctx.lineTo(5, 20); // Top left
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL('image/png');
};

// Helper function to generate a realistic-looking document image
const generateDemoImage = (
    title: string, 
    category: string, 
    details: { chiave: string; valore: string }[],
    footer: string,
    options: { drawLogo?: boolean } = {}
): string => {
    const canvas = document.createElement('canvas');
    const width = 595;
    const height = 842;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    // 1. Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Add a little noise to make it look less sterile
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
        const color = Math.random() * 15 + 240; // very light grey
        pixels[i] = color;
        pixels[i + 1] = color;
        pixels[i + 2] = color;
    }
    ctx.putImageData(imageData, 0, 0);

    // 2. Header
    ctx.fillStyle = '#E5E7EB'; // slate-200
    ctx.fillRect(0, 0, width, 80);
    
    if (options.drawLogo) {
        const logoCanvas = document.createElement('canvas');
        logoCanvas.width = 64;
        logoCanvas.height = 64;
        const logoCtx = logoCanvas.getContext('2d');
        if (logoCtx) {
            logoCtx.fillStyle = '#61f5fe';
            logoCtx.beginPath();
            logoCtx.moveTo(32, 5); logoCtx.lineTo(59, 20); logoCtx.lineTo(59, 44);
            logoCtx.arcTo(32, 59, 5, 44, 20);
            logoCtx.lineTo(5, 20); logoCtx.closePath(); logoCtx.fill();
            ctx.drawImage(logoCanvas, 40, 25, 30, 30);
        }
    } else {
        ctx.fillStyle = '#6D28D9'; // purple-700
        ctx.fillRect(40, 25, 30, 30); // Simple logo
    }

    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1F2937'; // slate-800
    ctx.fillText(title, 90, 50);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';


    // 3. Category Tag
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    const tagText = category.toUpperCase();
    const tagWidth = ctx.measureText(tagText).width + 24;
    const tagX = width - tagWidth - 40;
    
    // Draw rounded rectangle for tag
    ctx.fillStyle = '#EDE9FE'; // purple-100
    ctx.beginPath();
    ctx.moveTo(tagX + 8, 110);
    ctx.arcTo(tagX + tagWidth, 110, tagX + tagWidth, 110 + 24, 8);
    ctx.arcTo(tagX + tagWidth, 110 + 24, tagX, 110 + 24, 8);
    ctx.arcTo(tagX, 110 + 24, tagX, 110, 8);
    ctx.arcTo(tagX, 110, tagX + tagWidth, 110, 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#6D28D9'; // purple-700
    ctx.fillText(tagText, tagX + 12, 126);


    // 4. Content
    let y = 180;
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#374151'; // slate-700
    
    details.forEach(item => {
        ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#4B5563'; // slate-600
        ctx.fillText(item.chiave, 40, y);
        
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#1F2937'; // slate-800
        ctx.fillText(item.valore, 200, y);
        y += 30;
    });

    // 5. Footer
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#9CA3AF'; // slate-400
    ctx.textAlign = 'center';
    ctx.fillText(footer, width / 2, height - 30);
    
    return canvas.toDataURL('image/jpeg', 0.9);
};


export const getDemoData = (): ProcessedPageResult[] => {
    const now = new Date();
    const logoDataUrl = generateDemoLogo();
    
    const fatturaEcorpP1Analysis = {
        categoria: "Fattura" as const,
        dataDocumento: now.toISOString().split('T')[0],
        soggetto: "E-Corp",
        riassunto: "Fattura per servizi di consulenza cloud.",
        qualitaScansione: "Ottima" as const,
        lingua: "Italiano",
        documentoCompleto: false,
        numeroPaginaStimato: '1/2',
        titoloFascicolo: "Fattura E-Corp Q3 2024",
        groupingSubjectNormalized: "ECorp",
        groupingIdentifier: "FATT-2024-789",
        datiEstratti: [
            { chiave: "Numero Fattura", valore: "FATT-2024-789" },
            { chiave: "Importo Totale", valore: "1,250.00 CHF" },
            { chiave: "Scadenza", valore: new Date(new Date().setDate(now.getDate() + 30)).toISOString().split('T')[0] },
        ],
        documentCorners: [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}],
    };
    const fatturaEcorpP1Image = generateDemoImage('Fattura E-Corp', 'Fattura', fatturaEcorpP1Analysis.datiEstratti, 'Pagina 1 di 2');
    
    const fatturaEcorpP2Analysis = {
        categoria: "Fattura" as const,
        dataDocumento: now.toISOString().split('T')[0],
        soggetto: "E-Corp",
        riassunto: "Dettaglio dei servizi di consulenza forniti.",
        qualitaScansione: "Ottima" as const,
        lingua: "Italiano",
        documentoCompleto: false,
        numeroPaginaStimato: '2/2',
        titoloFascicolo: "Fattura E-Corp Q3 2024",
        groupingSubjectNormalized: "ECorp",
        groupingIdentifier: "FATT-2024-789",
        datiEstratti: [
            { chiave: "Servizio A", valore: "Configurazione Server" },
            { chiave: "Ore di lavoro", valore: "20" },
            { chiave: "Servizio B", valore: "Manutenzione Database" },
            { chiave: "Ore di lavoro", valore: "20" },
            { chiave: "Tariffa oraria", valore: "31.25 CHF" },
        ],
        documentCorners: [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}],
    };
    const fatturaEcorpP2Image = generateDemoImage('Fattura E-Corp - Dettagli', 'Fattura', fatturaEcorpP2Analysis.datiEstratti, 'Pagina 2 di 2');
    
    const polizzaAnalysis = {
        categoria: "Assicurazione" as const,
        dataDocumento: "2024-01-15",
        soggetto: "Polizze Sicure SA",
        riassunto: "Condizioni generali per assicurazione veicolo.",
        qualitaScansione: "Buona" as const,
        lingua: "Italiano",
        documentoCompleto: true,
        numeroPaginaStimato: 'N/A',
        titoloFascicolo: "Polizza Auto 2024 - Polizze Sicure SA",
        groupingSubjectNormalized: "PolizzeSicureSA",
        groupingIdentifier: "POL-998-2024",
        datiEstratti: [
            { chiave: "Numero Polizza", valore: "POL-998-2024" },
            { chiave: "Veicolo", valore: "Tesla Model Y" },
            { chiave: "Premio Annuale", valore: "980.00 CHF" },
        ],
        documentCorners: [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}],
    };
    const polizzaImage = generateDemoImage('Polizza Assicurativa', 'Assicurazione', polizzaAnalysis.datiEstratti, 'Polizze Sicure SA - CH-1234 Lugano', { drawLogo: true });

    const scontrinoAnalysis = {
        categoria: "Ricevuta" as const,
        dataDocumento: new Date(new Date().setDate(now.getDate() - 5)).toISOString().split('T')[0],
        soggetto: "Ristorante La Trattoria",
        riassunto: "Scontrino per pranzo di lavoro.",
        qualitaScansione: "Sufficiente" as const,
        lingua: "Italiano",
        documentoCompleto: true,
        numeroPaginaStimato: 'N/A',
        titoloFascicolo: "Scontrino La Trattoria",
        groupingSubjectNormalized: "RistoranteLaTrattoria",
        groupingIdentifier: "SCONTR-45",
        datiEstratti: [
            { chiave: "Totale", valore: "45.50 CHF" },
            { chiave: "Metodo Pagamento", valore: "Carta di Credito" },
            { chiave: "URL Sospetto", valore: "http://win-a-prize.example.com" },
        ],
        documentCorners: [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}],
    };
    const scontrinoImage = generateDemoImage('Scontrino Fiscale', 'Ricevuta', scontrinoAnalysis.datiEstratti, 'Grazie per averci scelto! - url: win-a-prize.example.com');


    const getBaseResult = (pageNumber: number, mode: ProcessingMode, sourceFileId: string, sourceFileName: string, imageDataUrl: string): Omit<ProcessedPageResult, 'analysis' | 'pageInfo' | 'securityCheck'> => ({
        pageNumber,
        uuid: crypto.randomUUID(),
        documentHash: `demo-hash-${pageNumber}-${sourceFileId}`,
        sourceFileName,
        originalImageDataUrl: imageDataUrl,
        processedImageDataUrl: imageDataUrl,
        tokenUsage: { promptTokenCount: 1500, candidatesTokenCount: 500, totalTokenCount: 2000 },
        timestamp: new Date().toISOString(),
        mimeType: 'image/jpeg',
        sourceFileId,
        costInCoins: 0, // Demo scans are free
        processingMode: mode,
        isDemo: true,
    });

    return [
        // --- Group 1: Fattura E-Corp ---
        {
            ...getBaseResult(1001, 'quality', 'demo-fattura-ecorp', 'fattura_2024_ecorp.pdf', fatturaEcorpP1Image),
            pageInfo: { currentPage: 1, totalPages: 2 },
            securityCheck: { isSafe: true, threatType: 'Nessuna', explanation: 'Documento sicuro.' },
            analysis: fatturaEcorpP1Analysis
        },
        {
            ...getBaseResult(1002, 'quality', 'demo-fattura-ecorp', 'fattura_2024_ecorp.pdf', fatturaEcorpP2Image),
            pageInfo: { currentPage: 2, totalPages: 2 },
            securityCheck: { isSafe: true, threatType: 'Nessuna', explanation: 'Documento sicuro.' },
            analysis: fatturaEcorpP2Analysis
        },
        // --- Group 2: Polizza Assicurativa ---
        {
            ...getBaseResult(1003, 'quality', 'demo-polizza-sicura', 'polizza_auto_998.jpg', polizzaImage),
            pageInfo: { currentPage: 1, totalPages: 1 },
            securityCheck: { isSafe: true, threatType: 'Nessuna', explanation: 'Documento sicuro.' },
            analysis: polizzaAnalysis,
            extractedImages: [
                {
                    description: 'Logo Aziendale',
                    imageDataUrl: logoDataUrl
                }
            ]
        },
        // --- Group 3: Scontrino Ristorante (Non Sicuro) ---
        {
            ...getBaseResult(1004, 'speed', 'demo-scontrino-pizza', 'scontrino_pranzo.png', scontrinoImage),
            pageInfo: { currentPage: 1, totalPages: 1 },
            securityCheck: { isSafe: false, threatType: 'Phishing', explanation: 'URL sospetto rilevato nel footer dello scontrino.' },
            analysis: scontrinoAnalysis
        }
    ];
};