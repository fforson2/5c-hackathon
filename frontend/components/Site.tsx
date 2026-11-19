"use client";

import { api } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";
import { Faq } from "./Faq";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Prizes } from "./Prizes";
import { RegisterForm } from "./RegisterForm";
import { Schedule } from "./Schedule";
import { TeamBoard } from "./TeamBoard";
import { Tracks } from "./Tracks";
import { ErrorNote, Loading } from "./ui";

export function Site() {
  const { state, reload } = useAsync(api.getEvent);

  if (state.status !== "success") {
    return (
      <main className="mx-auto max-w-5xl px-6 py-32">
        <h1 className="text-6xl font-semibold tracking-tight sm:text-8xl">5C Hackathon</h1>
        <div className="mt-10 text-lg">
          {state.status === "loading" ? (
            <Loading label="event" />
          ) : (
            <ErrorNote message={`Couldn't load the event. ${state.message}`} onRetry={reload} />
          )}
        </div>
      </main>
    );
  }

  const event = state.data;
  return (
    <>
      <Header name={event.name} />
      <main>
        <Hero event={event} />
        <Tracks tracks={event.tracks} />
        <Prizes prizes={event.prizes} />
        <Schedule />
        <Faq />
        <RegisterForm tracks={event.tracks} />
        <TeamBoard tracks={event.tracks} />
      </main>
      <Footer name={event.name} />
    </>
  );
}
