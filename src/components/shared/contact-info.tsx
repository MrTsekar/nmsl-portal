"use client";

import { useQuery } from "@tanstack/react-query";
import { contactApi } from "@/lib/api/contact.api";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export function ContactInfo() {
  const { data: contact, isLoading } = useQuery({
    queryKey: ["contact"],
    queryFn: contactApi.get,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Phone */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500 rounded-lg shrink-0">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Phone</h3>
              <p className="text-slate-600 dark:text-slate-400">For Enquiry: {contact.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-500 rounded-lg shrink-0">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Email</h3>
              <p className="text-slate-600 dark:text-slate-400">{contact.emailPrimary}</p>
              {contact.emailSecondary && (
                <p className="text-slate-600 dark:text-slate-400">{contact.emailSecondary}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-700 dark:bg-slate-600 rounded-lg shrink-0">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Location</h3>
              <p className="text-slate-600 dark:text-slate-400">{contact.addressLine1}</p>
              <p className="text-slate-600 dark:text-slate-400">{contact.addressLine2}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office Hours */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500 rounded-lg shrink-0">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Office Hours</h3>
              <p className="text-slate-600 dark:text-slate-400">{contact.officeHours}</p>
              <p className="text-slate-600 dark:text-slate-400">Emergency: {contact.emergencyHours}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
