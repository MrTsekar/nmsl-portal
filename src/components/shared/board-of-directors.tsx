"use client";

import { useQuery } from "@tanstack/react-query";
import { boardMembersApi } from "@/lib/api/board-members.api";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { UserCircle } from "lucide-react";

export function BoardOfDirectors() {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["board-members"],
    queryFn: boardMembersApi.list,
  });

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Board of Directors
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Leadership committed to excellence in healthcare delivery. Our Board provides strategic oversight and governance, ensuring our medical services maintain the highest standards of quality, safety, and patient-centered care.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card
                key={i}
                className="animate-pulse"
              >
                <CardContent className="p-0">
                  <div className="w-full h-64 bg-slate-200 dark:bg-slate-700" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (members.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Board of Directors
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Leadership committed to excellence in healthcare delivery. Our Board provides strategic oversight and governance, ensuring our medical services maintain the highest standards of quality, safety, and patient-centered care.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {members.map((member) => (
            <Card
              key={member.id}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <CardContent className="p-0">
                <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      width={300}
                      height={256}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <UserCircle className="h-24 w-24 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {member.title}
                  </p>
                  {member.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {member.bio}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
