"use client";

import { useQuery } from "@tanstack/react-query";
import { partnersApi } from "@/lib/api/partners.api";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export function TrustedPartners() {
  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: partnersApi.list,
  });

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Trusted Partners
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Collaborating with leading organizations to deliver excellence
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="p-6 sm:p-8 flex flex-col items-center justify-center gap-4 animate-pulse"
              >
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Trusted Partners
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Collaborating with leading organizations to deliver excellence
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {partners.map((partner) => (
            <Card
              key={partner.id}
              className="group p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <div className="relative w-full h-20 sm:h-24 flex items-center justify-center">
                <Image
                  src={partner.logoUrl}
                  alt={partner.name}
                  width={120}
                  height={80}
                  className="object-contain max-w-full max-h-full filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              </div>
              <p className="text-xs sm:text-sm font-medium text-center text-slate-700 dark:text-slate-300 line-clamp-2">
                {partner.name}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
