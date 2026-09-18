"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageShell, PageHero } from "@/components/page-shell";
import { TOURISM } from "@/lib/mock-data";
import { Calendar, MapPin, Camera } from "lucide-react";
import Link from "next/link";

export default function TourismPage() {
  const palette = ["primary", "gold", "info", "success", "warning", "primary"];
  return (
    <PageShell>
      <PageHero
        eyebrow="Tourism & Culture"
        title="Where Yoruba heritage meets modern hospitality"
        subtitle="From Arakanga Forest Reserve to historic chieftaincy traditions and serene eco-tourism hubs  -  the LGA is a living gallery of Egba culture, agriculture and hospitality."
      />

      <section className="container mx-auto px-4 py-14">
        <Card className="overflow-hidden border-border/40 bg-gradient-hero text-primary-foreground p-10 md:p-14 mb-12">
          <Badge className="bg-gold/20 text-gold border-gold/30">
            Heritage & Nature
          </Badge>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">
            Arakanga Forest Reserve & Cultural Heritage  -  A celebration of Egba
            identity
          </h2>
          <p className="mt-3 opacity-90 max-w-2xl">
            Home to historic reserves, granite formations, traditional
            craftsmanship and serene agrarian landscapes across the LGA's 10
            wards.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              <Link href="/news">Festival calendar</Link>
            </Button>
            {/* <Button
              asChild
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <Link href="/gallery">Photo gallery</Link>
            </Button> */}
          </div>
        </Card>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          Places to visit
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOURISM.map((t, i) => (
            <Card
              key={t.title}
              className="overflow-hidden bg-gradient-card border-border/40 hover:shadow-elegant transition-smooth"
            >
              <div
                className="h-40 relative"
                style={{
                  background: `linear-gradient(135deg, color-mix(in oklab, var(--${palette[i % palette.length]}) 60%, transparent), color-mix(in oklab, var(--gold) 40%, transparent))`,
                }}
              >
                <Camera className="h-8 w-8 absolute bottom-3 right-3 text-white/70" />
              </div>
              <div className="p-5">
                <Badge variant="outline">{t.tag}</Badge>
                <h3 className="mt-2 font-semibold">{t.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-14">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Calendar,
              title: "Annual festivals",
              desc: "Ojude Oba, Egungun, harvest and end-of-year community festivities.",
            },
            {
              icon: MapPin,
              title: "10 vibrant wards",
              desc: "Each with its own micro-culture, foods and traditional crafts.",
            },
            {
              icon: Camera,
              title: "Storied palaces",
              desc: `Oluwo of Osiele / Osiele Royal Court 
Olu of Orile-Ilawo / Ilawo Traditional Kingdom, 
Olugbo Traditional/Chieftaincy Heritage`,
            },
          ].map((c) => (
            <Card key={c.title} className="p-6 bg-background border-border/40">
              <c.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

