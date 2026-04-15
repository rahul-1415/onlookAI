import { VideoPlayerShell } from "../../../../../src/components/session/video-player-shell";

interface SessionPageProps {
  params: {
    sessionId: string;
  };
}

export default function SessionPage({ params }: SessionPageProps) {
  return (
    <div className="space-y-6">
      <VideoPlayerShell sessionId={params.sessionId} />
    </div>
  );
}
