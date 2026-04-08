import { PagePlaceholder } from "@onlook/ui";

import { SessionTimelineShell } from "../../../../../src/components/session/session-timeline-shell";
import { VideoPlayerShell } from "../../../../../src/components/session/video-player-shell";

interface SessionPageProps {
  params: {
    sessionId: string;
  };
}

export default function SessionPage({ params }: SessionPageProps) {
  return (
    <div className="space-y-6">
      <PagePlaceholder
        eyebrow="Learner Session"
        title={`Session ${params.sessionId}`}
        description="Reserved for synchronized video playback, attention collection, intervention modal flows, and transcript-aware recovery."
      />
      <VideoPlayerShell sessionId={params.sessionId} />
      <SessionTimelineShell />
    </div>
  );
}
