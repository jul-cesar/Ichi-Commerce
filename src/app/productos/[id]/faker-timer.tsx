"use client";

import { useEffect, useState } from "react";

export function FakeCountdownTimer() {
  const [time, setTime] = useState("23:47:32");

  useEffect(() => {
    // Array de tiempos pre-definidos que van "bajando"
    const fakeTimes = [
      "23:47:32",
      "23:47:31",
      "23:47:30",
      "23:47:29",
      "23:47:28",
      "23:47:27",
      "23:47:26",
      "23:47:25",
      "23:47:24",
      "23:47:23",
      "23:47:22",
      "23:47:21",
      "23:47:20",
      "23:47:19",
      "23:47:18",
      "23:47:17",
      "23:47:16",
      "23:47:15",
      "23:47:14",
      "23:47:13",
      "23:47:12",
      "23:47:11",
      "23:47:10",
      "23:47:09",
      "23:47:08",
      "23:47:07",
      "23:47:06",
      "23:47:05",
      "23:47:04",
      "23:47:03",
      "23:47:02",
      "23:47:01",
      "23:47:00",
      "23:46:59",
      "23:46:58",
      "23:46:57",
      "23:46:56",
      "23:46:55",
    ];

    let currentIndex = 0;

    const timer = setInterval(() => {
      setTime(fakeTimes[currentIndex]);
      currentIndex = (currentIndex + 1) % fakeTimes.length; // Reinicia cuando llega al final
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded animate-pulse">
      {time}
    </span>
  );
}

export default FakeCountdownTimer;
