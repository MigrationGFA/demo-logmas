"use client";

import { Card } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PageShell, PageHero } from "@/components/page-shell";
import { FAQS } from "@/lib/mock-data";

// export const metadata = {
//     title: "FAQ  -  Ijebu North East LGA",
//     description:
//         "Answers to common questions about LOGMAS, certificates, levy payments and council services.",
//     openGraph: {
//         title: "FAQ  -  Ijebu North East LGA",
//         description: "Frequently asked questions.",
//     },
// };

export default function FAQPage() {
    return (
        <PageShell>
            <PageHero
                eyebrow="Help Center"
                title="Frequently Asked Questions"
                subtitle="Quick answers to the most common questions citizens, businesses and partners ask."
            />
            <section className="container mx-auto px-4 py-14 max-w-3xl">
                <Card className="p-2 bg-gradient-card border-border/40">
                    <Accordion type="single" collapsible className="w-full">
                        {FAQS.map((f, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="px-4">
                                <AccordionTrigger className="text-left font-semibold">{f.question}</AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                    {f.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Card>
            </section>
        </PageShell>
    );
}

