import { useState, useRef, useEffect, useLayoutEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { EventClickArg, DatesSetArg } from "@fullcalendar/core";
import { Event, ViewType } from "../types";
import { ChevronDown, ChevronUp, Calendar as CalendarIcon, List, Clock, X } from "lucide-react";

interface CalendarProps {
  events: Event[];
}

interface SelectedEvent {
  title: string;
  start: Date;
  end?: Date;
  color: string;
  isHoliday?: boolean;
  duration?: number;
  description?: string;
  target?: HTMLElement;
}

const Calendar = ({ events }: CalendarProps) => {
  const [view, setView] = useState<ViewType>("month");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Process events for FullCalendar with fallback unique ID
  const formattedEvents = events.map((event, index) => ({
    id: event.id || `${index}-${event.title}-${event.date}`,
    title: event.title,
    start: event.date,
    end: event.duration ? new Date(new Date(event.date).getTime() + event.duration * 60000) : undefined,
    backgroundColor: getColorClass(event.color),
    borderColor: getColorClass(event.color, "border"),
    textColor: getColorClass(event.color, "border"), // Use event color for text
    display: "block",
    extendedProps: {
      ...event,
      color: event.color,
    },
  }));

  // Helper function to convert color strings to actual color values
  function getColorClass(color: string, type: "bg" | "border" = "bg"): string {
    const colorMap: Record<string, string> = {
      blue: type === "bg" ? "#dbeafe" : "#3b82f6",
      red: type === "bg" ? "#fee2e2" : "#ef4444",
      green: type === "bg" ? "#dcfce7" : "#22c55e",
      yellow: type === "bg" ? "#fef9c3" : "#eab308",
      purple: type === "bg" ? "#f3e8ff" : "#a855f7",
    };
    return colorMap[color] || (type === "bg" ? "#f3f4f6" : "#9ca3af");
  }

  // Position modal within viewport bounds
  const adjustModalPosition = () => {
    if (!modalRef.current || !selectedEvent || !selectedEvent.target) return;

    const modal = modalRef.current;
    const eventRect = selectedEvent.target.getBoundingClientRect();
    const modalRect = modal.getBoundingClientRect();

    let left = eventRect.left + eventRect.width / 2 - modalRect.width / 2;
    let top = eventRect.top - modalRect.height - 10;

    if (top < 10) {
      top = eventRect.bottom + 10;
    }

    if (left < 10) left = 10;
    if (left + modalRect.width > window.innerWidth - 10) {
      left = window.innerWidth - modalRect.width - 10;
    }

    modal.style.left = `${left}px`;
    modal.style.top = `${top}px`;
    modal.style.transform = "none";
  };

  const handleEventClick = (info: EventClickArg) => {
    info.jsEvent.preventDefault();
    setSelectedEvent({
      title: info.event.title,
      start: info.event.start || new Date(),
      end: info.event.end || undefined,
      color: info.event.extendedProps.color,
      isHoliday: info.event.extendedProps.isHoliday,
      duration: info.event.extendedProps.duration,
      description: info.event.extendedProps.description || "No additional details available.",
      target: info.el,
    });
  };

  useLayoutEffect(() => {
    if (selectedEvent) {
      adjustModalPosition();
      window.addEventListener("resize", adjustModalPosition);
      return () => window.removeEventListener("resize", adjustModalPosition);
    }
  }, [selectedEvent]);

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  const handleViewChange = (viewType: ViewType) => {
    setView(viewType);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(
        viewType === "month" ? "dayGridMonth" :
        viewType === "week" ? "timeGridWeek" :
        viewType === "day" ? "timeGridDay" : "listMonth"
      );
    }
  };

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.updateSize();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleWindowResize = () => {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.updateSize();
      }
    };
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  // Apply background colors to days with events
  useEffect(() => {
    if (calendarRef.current) {
      const applyDayColors = () => {
        const eventsByDate: Record<string, Event[]> = {};
        events.forEach((event) => {
          const dateStr = new Date(event.date).toDateString();
          if (!eventsByDate[dateStr]) {
            eventsByDate[dateStr] = [];
          }
          eventsByDate[dateStr].push(event);
        });

        document.querySelectorAll(".fc-daygrid-day").forEach((dayEl) => {
          const dateAttr = dayEl.getAttribute("data-date");
          if (dateAttr) {
            const date = new Date(dateAttr);
            const dateStr = date.toDateString();
            const dayEvents = eventsByDate[dateStr];
            if (dayEvents && dayEvents.length > 0) {
              const baseColor = getColorClass(dayEvents[0].color, "bg");
              (dayEl as HTMLElement).style.backgroundColor = baseColor;

              const eventCount = dayEvents.length;
              if (eventCount > 1) {
                const countEl = dayEl.querySelector(".event-count") || document.createElement("div");
                countEl.className = "event-count";
                countEl.textContent = `${eventCount} events`;
                countEl.style.position = "absolute";
                countEl.style.bottom = "2px"; // Reduced size
                countEl.style.right = "2px";
                countEl.style.fontSize = "8px"; // Smaller font
                countEl.style.padding = "1px 3px"; // Smaller padding
                countEl.style.backgroundColor = getColorClass(dayEvents[0].color, "border");
                countEl.style.color = "#ffffff";
                countEl.style.borderRadius = "3px";

                if (!dayEl.querySelector(".event-count")) {
                  (dayEl as HTMLElement).style.position = "relative";
                  dayEl.appendChild(countEl);
                }
              }
            }
          }
        });
      };

      setTimeout(applyDayColors, 100);
      const calendarApi = calendarRef.current.getApi();
      calendarApi.on("datesSet", applyDayColors as (arg: DatesSetArg) => void);
      return () => {
        calendarApi.off("datesSet", applyDayColors as (arg: DatesSetArg) => void);
      };
    }
  }, [events, view]);

  // Format dates for event modal
  const formatEventDate = (date?: Date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const renderEventModal = () => {
    if (!selectedEvent) return null;

    const eventColor = getColorClass(selectedEvent.color, "border");

    return (
      <div className="fixed z-50 pointer-events-none inset-0 bg-transparent flex items-start justify-start">
        <div
          ref={modalRef}
          className="pointer-events-auto bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden absolute"
          style={{ maxWidth: "300px" }} // Reduced modal size
        >
          <div style={{ backgroundColor: eventColor }} className="p-3 text-white">
            <div className="flex justify-between items-start">
              <h3 className="text-md font-semibold">{selectedEvent.title}</h3>
              <button onClick={closeEventModal} className="text-white hover:text-gray-200">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="p-3">
            <div className="mb-3">
              <div className="text-xs text-gray-600 mb-1 flex items-center">
                <CalendarIcon size={14} className="mr-1" />
                <span>Start: {formatEventDate(selectedEvent.start)}</span>
              </div>
              {selectedEvent.end && (
                <div className="text-xs text-gray-600 mb-1 flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>End: {formatEventDate(selectedEvent.end)}</span>
                </div>
              )}
              {selectedEvent.duration && (
                <div className="text-xs text-gray-600 flex items-center">
                  <Clock size={14} className="mr-1" />
                  <span>Duration: {selectedEvent.duration} minutes</span>
                </div>
              )}
            </div>
            {selectedEvent.isHoliday && (
              <div className="mb-3 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full inline-block">
                Holiday
              </div>
            )}
            <p className="text-gray-700 text-xs">{selectedEvent.description}</p>
          </div>
          <div className="bg-gray-50 px-3 py-2 flex justify-end">
            <button
              onClick={closeEventModal}
              className="px-3 py-1 text-white rounded hover:opacity-90 text-xs font-medium"
              style={{ backgroundColor: eventColor }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    return (
      <div
        className="fullcalendar-container"
        style={{
          height: "auto",
          width: "100%",
          transition: "height 0.3s ease-in-out",
        }}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={formattedEvents}
          eventClick={handleEventClick}
          height="auto" // Fit content
          aspectRatio={isExpanded ? 1.8 : 1.35}
          expandRows={true}
          stickyHeaderDates={true}
          nowIndicator={true}
          dayMaxEvents={3}
          forceEventDuration={true}
          eventDisplay="block"
          slotEventOverlap={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={true}
          allDayText="All Day"
        />
      </div>
    );
  };

  const getViewIcon = (viewType: ViewType) => {
    switch (viewType) {
      case "month": return <CalendarIcon size={16} />;
      case "week": return <CalendarIcon size={16} />;
      case "day": return <CalendarIcon size={16} />;
      default: return <List size={16} />;
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-lg transition-all duration-300 ${
        isExpanded ? "w-full" : "w-3/4 sm:w-2/3 md:w-1/2 mx-auto"
      }`}
      style={{ maxWidth: isExpanded ? "100%" : "800px" }} // Reduced max width
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white border-b">
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-0">
          {(["month", "week", "day", "list"] as ViewType[]).map((viewType) => (
            <button
              key={viewType}
              onClick={() => handleViewChange(viewType)}
              className={`px-2 py-1 rounded-md text-xs transition-colors flex items-center ${
                view === viewType
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="mr-1">{getViewIcon(viewType)}</span>
              <span>{viewType.charAt(0).toUpperCase() + viewType.slice(1)}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors flex items-center"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} className="mr-1" />
              <span>Compact</span>
            </>
          ) : (
            <>
              <ChevronDown size={14} className="mr-1" />
              <span>Expand</span>
            </>
          )}
        </button>
      </div>
      <div className="p-2">{renderCalendar()}</div>
      {renderEventModal()}

      <style jsx global>{`
        .fc {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .fc .fc-toolbar-title {
          font-size: 1rem; /* Reduced size */
          font-weight: 600;
        }
        .fc .fc-button {
          border-radius: 0.25rem;
          border: none;
          background-color: #eff6ff;
          color: #3b82f6;
          font-weight: 500;
          padding: 0.25rem 0.5rem; /* Reduced padding */
          transition: all 0.2s;
          font-size: 0.75rem; /* Smaller font */
        }
        .fc .fc-button:hover {
          background-color: #dbeafe;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #3b82f6;
          color: white;
        }
        .fc .fc-button-primary:disabled {
          background-color: #e5e7eb;
          color: #9ca3af;
        }
        .fc .fc-daygrid-day-number,
        .fc .fc-col-header-cell-cushion {
          padding: 0.25rem; /* Reduced padding */
          text-decoration: none;
          color: #374151;
          font-size: 0.75rem; /* Smaller font */
        }
        .fc .fc-daygrid-day.fc-day-today {
          background-color: #eff6ff !important;
        }
        .fc .fc-daygrid-day-top {
          justify-content: center;
          padding-top: 0.15rem; /* Reduced padding */
        }
        .fc .fc-daygrid-day-number {
          float: none;
        }
        .fc-event {
          border-radius: 3px;
          border-left-width: 3px;
          font-size: 0.75rem; /* Reduced font size */
          padding: 0.15rem 0.3rem; /* Reduced padding */
          cursor: pointer;
          transition: transform 0.1s;
          z-index: 5;
          white-space: normal;
          overflow: visible;
        }
        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .fc-daygrid-event-dot {
          display: none;
        }
        .fc-event-time {
          display: none;
        }
        .fc .fc-daygrid-day {
          transition: background-color 0.3s ease;
          position: relative;
        }
        .fc .fc-daygrid-day-frame {
          min-height: 4em; /* Reduced cell height */
        }
        .fc .fc-timegrid-slot {
          height: 1.5rem; /* Reduced slot height */
        }
        .fc .fc-timegrid-axis-cushion {
          color: #6b7280;
          font-size: 0.65rem; /* Smaller font */
        }
        .fc th,
        .fc .fc-daygrid-day {
          border-color: #e5e7eb;
        }
        .fc-dayGridMonth-view .fc-daygrid-body {
          width: 100% !important;
        }
        .fc table {
          width: 100% !important;
        }
        .fc .fc-scrollgrid-section table {
          width: 100% !important;
        }
        .fc-list {
          border: 1px solid #e5e7eb;
        }
        .fc-list-day-cushion {
          background-color: #f9fafb !important;
        }
        .fc-list-event:hover td {
          background-color: #f3f4f6;
        }
        .fc .fc-daygrid-day:hover {
          filter: brightness(0.97);
        }
        @media (max-width: 640px) {
          .fc .fc-toolbar-title {
            font-size: 0.875rem;
          }
          .fc .fc-daygrid-day-number,
          .fc .fc-col-header-cell-cushion {
            padding: 0.15rem;
            font-size: 0.65rem;
          }
          .fc .fc-daygrid-day-frame {
            min-height: 3em;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;