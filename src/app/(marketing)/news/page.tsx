"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell, PageHero } from "@/components/page-shell";
import { NEWS } from "@/config/lgaContent.config";
import { Calendar, ArrowRight, Search } from "lucide-react";

const EXTENDED_NEWS = [
    ...NEWS,
    // { date: "25 Apr 2026", tag: "Project", title: "Atan Central Market Renovation enters Phase 2" },
    // {
    //     date: "18 Apr 2026",
    //     tag: "Empowerment",
    //     title: "Chairman launches 2,000-youth digital skills program",
    // },
    // { date: "10 Apr 2026", tag: "Health", title: "Free maternal health outreach across 10 wards" },
    // { date: "02 Apr 2026", tag: "Culture", title: "Council confirms 2026 Ojude Oba support package" },
    // {
    //     date: "28 Mar 2026",
    //     tag: "Revenue",
    //     title: "IGR crosses ₦1.8B milestone via LOGMAS digitization",
    // },
];

export default function NewsPage() {
    return (
        <PageShell>
            <PageHero
                eyebrow="News & Events"
                title="Updates from your council"
                subtitle="Stay informed with announcements, press releases, project updates and community events."
            />
            <section className="container mx-auto px-4 py-14">
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search news, events, announcements..." className="pl-9" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {["All", "Announcement", "Event", "Project", "Health", "Culture"].map((t, i) => (
                            <Badge key={t} variant={i === 0 ? "default" : "outline"} className="cursor-pointer">
                                {t}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {EXTENDED_NEWS.map((n) => (
                        <Card
                            key={n.title}
                            className="p-6 bg-gradient-card border-border/40 hover:shadow-elegant transition-smooth"
                        >
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" /> {n.date}
                                <Badge variant="outline" className="ml-auto">
                                    {n.tag}
                                </Badge>
                            </div>
                            <h3 className="mt-3 font-semibold leading-snug">{n.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                Read the full update and discover how this development affects citizens, businesses
                                and partners across the LGA.
                            </p>
                            <Button asChild variant="ghost" size="sm" className="mt-3 px-0 text-primary">
                                <a href="/news">
                                    Read more <ArrowRight className="h-3 w-3 ml-1" />
                                </a>
                            </Button>
                        </Card>
                    ))}
                </div>
            </section>
        </PageShell>
    );
}
