import { Camera, Globe, Music2, SquarePlay } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FeedItem } from "@/modules/items/service";

const META = {
  INSTAGRAM: { label: "Instagram", icon: Camera },
  SPOTIFY: { label: "Spotify", icon: Music2 },
  YOUTUBE: { label: "YouTube", icon: SquarePlay },
  OTHER: { label: "Link", icon: Globe },
} as const;

export function PlatformBadge({ platform }: { platform: FeedItem["platform"] }) {
  const { label, icon: Icon } = META[platform];
  return (
    <Badge>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </Badge>
  );
}
