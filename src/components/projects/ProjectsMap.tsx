import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Building2 } from 'lucide-react';
import type { ProjectWithDeveloper } from '@/hooks/useProjects';
import { formatCurrency } from '@/lib/format';

// Mapbox public token (replace with your token if needed)
mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY200NXd6aWtrMDI3MTJrcTQ0YjV2a2wxdCJ9.example';

interface ProjectsMapProps {
  projects: ProjectWithDeveloper[];
  onProjectClick?: (project: ProjectWithDeveloper) => void;
  className?: string;
}

const statusColors: Record<string, string> = {
  completed: '#10b981',
  under_construction: '#f59e0b',
  upcoming: '#3b82f6',
  iconic: '#c9a961',
};

export function ProjectsMap({ projects, onProjectClick, className }: ProjectsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Filter projects with valid coordinates
  const projectsWithCoords = projects.filter(
    p => p.latitude && p.longitude && 
    Math.abs(p.latitude) <= 90 && 
    Math.abs(p.longitude) <= 180
  );

  const initializeMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [55.2708, 25.2048], // Dubai coordinates
        zoom: 10,
        attributionControl: false,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      map.current.on('error', () => {
        setMapError(true);
      });
    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    initializeMap();

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

  // Add markers when map is loaded and projects change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    projectsWithCoords.forEach((project) => {
      if (!project.latitude || !project.longitude) return;

      const color = statusColors[project.status || 'completed'] || statusColors.completed;
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'project-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `;
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>`;
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'project-popup',
      }).setHTML(`
        <div style="padding: 8px; min-width: 200px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${project.name}</div>
          ${project.developer?.name ? `<div style="font-size: 12px; color: #888; margin-bottom: 4px;">${project.developer.name}</div>` : ''}
          ${project.location_area ? `<div style="font-size: 12px; color: #888;">${project.location_area}</div>` : ''}
          ${project.starting_price ? `<div style="font-size: 14px; color: #c9a961; font-weight: 600; margin-top: 8px;">From ${formatCurrency(project.starting_price)}</div>` : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([project.longitude, project.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onProjectClick?.(project);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if we have projects
    if (projectsWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      projectsWithCoords.forEach(p => {
        if (p.longitude && p.latitude) {
          bounds.extend([p.longitude, p.latitude]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 13 });
    }
  }, [projectsWithCoords, mapLoaded, onProjectClick]);

  if (mapError) {
    return (
      <div className={`relative bg-muted rounded-xl overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Map Unavailable</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            The map couldn't be loaded. Please try again later or switch to grid view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[500px]" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-xs font-medium mb-2">Project Status</div>
        <div className="space-y-1.5">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs capitalize">
                {status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Project Count */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <span className="text-sm font-medium">
          {projectsWithCoords.length} project{projectsWithCoords.length !== 1 ? 's' : ''} on map
        </span>
      </div>
    </div>
  );
}
