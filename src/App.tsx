import { useState } from "react";
import Calendar from "./components/Calendar";
import { Event } from "./types";

function App() {
  const [events] = useState<Event[]>([
    {
      id: "1",
      title: "Team Meeting",
      date: new Date(2025, 3, 10, 14, 0), // April 10, 2025, 2:00 PM
      color: "blue",
      duration: 60,
    },
    {
      id: "2",
      title: "Fun Meeting",
      date: new Date(2025, 3, 10, 17, 0), // April 10, 2025, 5:00 PM
      color: "green",
      duration: 60,
    },
    {
      id: "3",
      title: "Easter",
      date: new Date(2025, 3, 20), // April 20, 2025
      color: "red",
      isHoliday: true,
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center">
        Interactive Calendar
      </h1>
      <div className="w-full">
        <Calendar events={events} />
      </div>
    </div>
  );
}

export default App;