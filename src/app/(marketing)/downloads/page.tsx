"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell, PageHero } from "@/components/page-shell";
import { DOWNLOADS } from "@/config/lgaContent.config";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

// export const metadata = {
//     title: "Downloads  -  Ijebu North East LGA",
//     description:
//         "Official documents, citizen charters, budgets, tariffs and guides from Ijebu North East Local Government.",
//     openGraph: {
//         title: "Downloads  -  Ijebu North East LGA",
//         description: "Official council documents.",
//     },
// };

export default function DownloadsPage() {
    return (
        <PageShell>
            <PageHero
                eyebrow="Resources"
                title="Official downloads"
                subtitle="Citizen charters, budgets, investment guides, tariffs and operational manuals  -  all in one place."
            />
            <section className="container mx-auto px-4 py-14">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DOWNLOADS.map((d) => (
                        <Card
                            key={d.title}
                            className="p-5 bg-gradient-card border-border/40 flex items-center gap-4 hover:shadow-elegant transition-smooth"
                        >
                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{d.title}</div>
                                <div className="text-xs text-muted-foreground">
                                    {d.type} · {d.size}
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.success(`${d.title} downloaded`)}
                            >
                                <Download className="h-3.5 w-3.5" />
                            </Button>
                        </Card>
                    ))}
                </div>
            </section>
        </PageShell>
    );
}

