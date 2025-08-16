import React from 'react';
import Issue1 from './Issue1';
import IssuePlaceholder from './IssuePlaceholder';

export interface NewsletterIssue {
    id: number;
    title: string;
    date: string;
    summary: string;
    component: React.FC<any>;
}

export const newsletterContent: NewsletterIssue[] = [
    {
        id: 1,
        title: "Benvenuti a UnHub.ch!",
        date: "10 Ottobre 2025",
        summary: "Scopri la nostra nuova piattaforma unificata e come i nostri servizi lavorano insieme per semplificare la tua vita digitale.",
        component: Issue1,
    },
    ...Array.from({ length: 19 }, (_, i) => ({
        id: i + 2,
        title: `Newsletter #${i + 2}: Novità in Arrivo`,
        date: "Prossimamente",
        summary: "Stiamo lavorando a nuovi contenuti e funzionalità entusiasmanti. Resta sintonizzato per futuri aggiornamenti!",
        component: (props) => <IssuePlaceholder {...props} issueNumber={i + 2} />,
    })),
];