"use client";
import Calendar from "@/lib/components/Calendar";
import SideBar from "@/lib/components/SideBar";
import { NextUIProvider } from "@nextui-org/react";
export default function Home() {
  return (
    <NextUIProvider>
      <main className="grid grid-cols-12">
        <SideBar />
        <Calendar />
      </main>
    </NextUIProvider>
  );
}
