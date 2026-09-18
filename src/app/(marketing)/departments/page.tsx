"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell, PageHero } from "@/components/page-shell";
import { DEPARTMENTS } from "@/config/lgaContent.config";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

type IconName = keyof typeof Icons;

export default function DepartmentsPage() {
    return (
        <PageShell>
            <PageHero
                eyebrow="Council Departments"
                title="Eight departments. One mission."
                subtitle="Every department is structured for efficient public service delivery, accountability and citizen impact."
            />
            <section className="container mx-auto px-4 py-14">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {DEPARTMENTS.map((d) => {
                        const Icon = (Icons[d.icon as unknown as IconName] ?? Icons.Building2) as LucideIcon;
                        return (
                            <Card
                                key={d.name}
                                className="p-6 bg-gradient-card border-border/40 hover:shadow-elegant hover:-translate-y-0.5 transition-smooth"
                            >
                                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-lg">{d.name}</h3>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                                <Button asChild variant="ghost" size="sm" className="mt-3 px-0 text-primary">
                                    <Link href="/contact">Contact department →</Link>
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </PageShell>
    );
}
