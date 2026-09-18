'use client';

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell, PageHero } from "@/components/page-shell";
import { INVEST_OPPS } from "@/config/lgaContent.config";
import * as Icons from "lucide-react";
import { ArrowRight, TrendingUp, CheckCircle2, Download } from "lucide-react";

// export const metadata = {
//     title: "Invest in Ijebu North East LGA",
//     description:
//         "Discover high-yield investment opportunities in agriculture, trade, real estate, logistics, tourism and the digital economy.",
//     openGraph: {
//         title: "Invest in Ijebu North East",
//         description: "High-yield investment opportunities in Ogun State.",
//     },
// };

export default function InvestPage() {
    return (
        <PageShell>
            <PageHero
                eyebrow="Investment Opportunities"
                title="Strategically positioned along the Abeokuta-Ibadan axis"
                subtitle="the LGA is connected to the wider Lagos-Ogun-Benin economic corridor and well placed to become a hub for agriculture, commerce, logistics, investment and regional economic development."
            >
                <div className="flex flex-wrap gap-3">
                    <Button asChild className="bg-gradient-hero shadow-elegant">
                        <Link href="/contact">
                            Contact Investment Desk <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                    </Button>
                    {/* <Button asChild variant="outline">
                        <Link href="/downloads">
                            Download Investment Guide <Download className="ml-1.5 h-4 w-4" />
                        </Link>
                    </Button> */}
                </div>
            </PageHero>

            <section className="container mx-auto px-4 py-14">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: "GDP Growth (LGA)", value: "8.4%" },
                        { label: "Registered Businesses", value: "12,640" },
                        { label: "Active Markets", value: "14" },
                        { label: "Avg. Investor ROI", value: "22%" },
                    ].map((s) => (
                        <Card key={s.label} className="p-5 bg-gradient-card border-border/40">
                            <TrendingUp className="h-5 w-5 text-success" />
                            <div className="mt-3 text-2xl font-bold">{s.value}</div>
                            <div className="text-xs text-muted-foreground">{s.label}</div>
                        </Card>
                    ))}
                </div>

                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Priority sectors</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {INVEST_OPPS.map((o) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const Icon = (Icons as any)[o.icon] ?? Icons.Building2;
                        return (
                            <Card
                                key={o.sector}
                                className="p-6 bg-gradient-card border-border/40 hover:shadow-elegant transition-smooth"
                            >
                                <div className="h-12 w-12 rounded-xl bg-gold/15 text-gold-foreground flex items-center justify-center mb-4">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">{o.sector}</h3>
                                    <Badge className="bg-success/10 text-success border-success/30">
                                        ROI {o.roi}
                                    </Badge>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{o.desc}</p>
                            </Card>
                        );
                    })}
                </div>
            </section>

            <section className="bg-secondary/40 py-14">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Why investors choose the LGA
                        </h2>
                        <ul className="mt-5 space-y-2.5 text-sm">
                            {[
                                "Strategic Lagos-Ogun-Benin corridor location",
                                "Modern, digital revenue & permits via LOGMAS",
                                "Single-window business registration",
                                "Fertile arable land & agro-value chains",
                                "Skilled youthful workforce",
                                "Investor-friendly council leadership",
                                "Transparent tariffs & receipts",
                                "Direct access to council executives",
                            ].map((b) => (
                                <li key={b} className="flex gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" /> {b}
                                </li>
                            ))}
                        </ul>
                        <Button asChild className="mt-6 bg-gradient-hero shadow-elegant">
                            <Link href="/contact">Schedule a meeting</Link>
                        </Button>
                    </div>
                    <Card className="p-8 bg-gradient-hero text-primary-foreground border-0">
                        <h3 className="text-xl font-bold">Investor Promise</h3>
                        <p className="mt-2 opacity-90 text-sm leading-relaxed">
                            Fast-tracked approvals, dedicated relationship managers, and end-to-end digital
                            compliance  -  backed by the personal commitment of the Office of the Chairman.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-lg bg-white/10">
                                <div className="opacity-80 text-xs">Approval window</div>
                                <div className="font-bold">14 days</div>
                            </div>
                            <div className="p-3 rounded-lg bg-white/10">
                                <div className="opacity-80 text-xs">Digital permits</div>
                                <div className="font-bold">100%</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>
        </PageShell>
    );
}

