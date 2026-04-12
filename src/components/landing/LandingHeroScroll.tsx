"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export function LandingHeroScroll() {
  return (
    <div className="flex flex-col overflow-hidden bg-background">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
              The future of <br />
              <span className="text-5xl md:text-[6rem] font-black mt-2 leading-none text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                Institutional Finance
              </span>
            </h1>
          </>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1551288049-bb8c803er-motion?auto=format&fit=crop&q=80&w=2840&h=1600"
          alt="FeeDesk Dashboard"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover h-full object-center shadow-2xl"
          draggable={false}
          priority
        />
      </ContainerScroll>
    </div>
  );
}
