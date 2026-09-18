"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageShell, PageHero } from "@/components/page-shell";
import { GALLERY } from "@/config/lgaContent.config";
import { Image as ImageIcon } from "lucide-react";

export default function GalleryPage() {
    const palette = ["primary", "gold", "info", "success", "warning", "primary", "gold", "info"];
    return (
        <PageShell>
            <PageHero
                eyebrow="Media Gallery"
                title="Moments that define our community"
                subtitle="A growing archive of agricultural shows, mining hubs, community projects and the everyday beauty of the Local Government Area."
            />
            <section className="container mx-auto px-4 py-14">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {GALLERY.map((g, i) => (
                        <Card key={g.title} className="overflow-hidden border-border/40 group cursor-pointer">
                            <div
                                className="h-44 relative flex items-end p-3"
                                style={{
                                    background: `linear-gradient(135deg, color-mix(in oklab, var(--${palette[i % palette.length]}) 70%, transparent), color-mix(in oklab, var(--gold) 40%, transparent))`,
                                }}
                            >
                                <ImageIcon className="absolute top-3 right-3 h-5 w-5 text-white/70" />
                                <Badge className="bg-black/40 text-white border-white/20 backdrop-blur">
                                    {g.category}
                                </Badge>
                            </div>
                            <div className="p-3">
                                <div className="font-medium text-sm">{g.title}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </PageShell>
    );
}
