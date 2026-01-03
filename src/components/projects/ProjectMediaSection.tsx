import { Video, View } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VirtualTourEmbed } from './VirtualTourEmbed';
import { ProjectVideoPlayer } from './ProjectVideoPlayer';

interface ProjectMediaSectionProps {
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  projectName: string;
  thumbnailUrl?: string;
  brandColor?: string;
}

export function ProjectMediaSection({
  videoUrl,
  virtualTourUrl,
  projectName,
  thumbnailUrl,
  brandColor
}: ProjectMediaSectionProps) {
  const hasVideo = !!videoUrl;
  const hasVirtualTour = !!virtualTourUrl;

  // If neither exists, don't render
  if (!hasVideo && !hasVirtualTour) return null;

  // If only one exists, render directly without tabs
  if (hasVideo && !hasVirtualTour) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Video className="h-5 w-5" style={{ color: brandColor }} />
          Project Video
        </h3>
        <ProjectVideoPlayer
          url={videoUrl}
          title={`${projectName} - Video Tour`}
          thumbnailUrl={thumbnailUrl}
          brandColor={brandColor}
        />
      </div>
    );
  }

  if (hasVirtualTour && !hasVideo) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <View className="h-5 w-5" style={{ color: brandColor }} />
          Virtual Tour
        </h3>
        <VirtualTourEmbed
          url={virtualTourUrl}
          title={`${projectName} - Virtual Tour`}
          brandColor={brandColor}
        />
      </div>
    );
  }

  // Both exist - show tabs
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Explore the Project</h3>
      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Tour
          </TabsTrigger>
          <TabsTrigger value="virtual-tour" className="flex items-center gap-2">
            <View className="h-4 w-4" />
            Virtual Tour
          </TabsTrigger>
        </TabsList>
        <TabsContent value="video" className="mt-4">
          <ProjectVideoPlayer
            url={videoUrl!}
            title={`${projectName} - Video Tour`}
            thumbnailUrl={thumbnailUrl}
            brandColor={brandColor}
          />
        </TabsContent>
        <TabsContent value="virtual-tour" className="mt-4">
          <VirtualTourEmbed
            url={virtualTourUrl!}
            title={`${projectName} - Virtual Tour`}
            brandColor={brandColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
