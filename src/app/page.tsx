"use client";

import { useState } from "react";
import AppGate from "@/components/AppGate";
import TopBar from "@/components/TopBar";
import Feed from "@/components/Feed";
import StoriesBar from "@/components/StoriesBar";
import NewPostForm from "@/components/NewPostForm";

export default function HomePage() {
  const [showNewPost, setShowNewPost] = useState(false);

  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <TopBar onNewPost={() => setShowNewPost(true)} />
        <main className="mx-auto max-w-xl px-4 py-4">
          <StoriesBar />
          <div className="mt-2">
            <Feed />
          </div>
        </main>
        {showNewPost && <NewPostForm onDone={() => setShowNewPost(false)} />}
      </div>
    </AppGate>
  );
}
