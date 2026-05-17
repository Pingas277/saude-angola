"use client";

export default function DoctorVideoFrame({
  videoUrl,
  doctorName,
}: {
  videoUrl: string;
  doctorName: string;
}) {
  const params = new URLSearchParams({
    "config.prejoinPageEnabled": "false",
    "config.startWithAudioMuted": "false",
    "userInfo.displayName": doctorName,
  });
  const embedUrl = `${videoUrl}#${params.toString()}`;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-foreground">
      <iframe
        src={embedUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="h-full w-full"
      />
    </div>
  );
}
