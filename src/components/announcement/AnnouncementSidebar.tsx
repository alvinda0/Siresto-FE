"use client";

import { useState, useEffect } from "react";
import { SidebarFooter } from "@/components/ui/sidebar";
import { ChevronDown, Megaphone } from "lucide-react";
import { announcementService } from "@/services/announcement.service";
import { Announcement } from "@/types/announcement";

export const AnnouncementSidebar = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementService.getAnnouncements({
        status: "ACTIVE",
      });
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    }
  };

  if (announcements.length === 0) {
    return null;
  }

  return (
    <SidebarFooter className="border-t p-3 bg-gradient-to-b from-white to-gray-50">
      <div className="space-y-2">
        <button
          onClick={() => setShowAnnouncement(!showAnnouncement)}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg hover:bg-orange-50 transition-all duration-200 group border border-transparent hover:border-orange-200"
        >
          <div className="p-1.5 rounded-md bg-orange-100 group-hover:bg-orange-200 transition-colors">
            <Megaphone className="h-4 w-4 text-orange-600" />
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-800 block">
              Pengumuman
            </span>
            <span className="text-xs text-gray-500">
              {announcements.length} pengumuman aktif
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              showAnnouncement ? "rotate-180" : ""
            }`}
          />
        </button>

        {showAnnouncement && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 hide-scrollbar">
            {announcements.map((announcement, index) => (
              <div
                key={announcement.announcement_id}
                className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-orange-300"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 flex-1 leading-tight">
                    {announcement.title}
                  </h4>
                </div>
                <div className="pl-8">
                  <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed mb-3">
                    {announcement.content}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                      <span className="text-xs text-gray-600 font-medium">
                        {announcement.created_by_name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarFooter>
  );
};
