"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell, PageHero } from "@/components/page-shell";
import { CAREERS } from "@/config/lgaContent.config";
import { Briefcase, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
    return (
        <PageShell>
            <PageHero
                eyebrow="Careers"
                title="Build the future of public service"
                subtitle="Join a council on the leading edge of digital governance, citizen impact and accountable public service."
            />
            <section className="container mx-auto px-4 py-14">
                <div className="grid gap-4">
                    {CAREERS.map((c) => (
                        <Card
                            key={c.title}
                            className="p-6 bg-gradient-card border-border/40 hover:shadow-elegant transition-smooth flex flex-col md:flex-row md:items-center gap-4"
                        >
                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">{c.title}</h3>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    <span>{c.dept}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {c.type}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {c.location}
                                    </span>
                                </div>
                            </div>
                            <Badge variant="outline">Deadline: {c.deadline}</Badge>
                            <Button asChild className="bg-gradient-hero">
                                <Link href="/contact">Apply</Link>
                            </Button>
                        </Card>
                    ))}
                </div>
            </section>
        </PageShell>
    );
}
