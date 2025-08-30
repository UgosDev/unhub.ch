import type { ProcessedPageResult } from './geminiService';

/**
 * Simulates sending documents to a partner application.
 * In a real-world scenario, this might use a custom protocol handler,
 * a BroadcastChannel, or an API call to a backend service that routes
 * the data. For this prototype, it logs to the console.
 *
 * @param targetApp The identifier for the target application (e.g., 'archivio.ch', 'polizze.ch').
 * @param pages An array of processed pages to be sent.
 */
export function sendToApp(targetApp: string, pages: ProcessedPageResult[]): void {
    if (!pages || pages.length === 0) {
        console.warn(`[Inter-App Service] Attempted to send to ${targetApp} with no documents.`);
        return;
    }
    
    console.log(`[Inter-App Service] Sending ${pages.length} page(s) to ${targetApp}:`);
    console.log({
        target: targetApp,
        documents: pages.map(p => ({
            uuid: p.uuid,
            source: p.sourceFileName,
            category: p.analysis.categoria,
            subject: p.analysis.soggetto,
        }))
    });

    // This is where the actual integration logic would go.
    // For this prototype, a simple log is sufficient to demonstrate the function call.
    // A real implementation might use a BroadcastChannel for cross-tab communication:
    /*
    try {
        const channel = new BroadcastChannel('app_communication');
        channel.postMessage({
            targetApp,
            payload: {
                documents: pages,
            }
        });
        channel.close();
    } catch (e) {
        console.error("BroadcastChannel is not supported in this browser or failed.", e);
        alert(`Could not automatically send to ${targetApp}. This feature may not be supported by your browser.`);
    }
    */
}
