import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeocodeResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  boundingBox?: {
    sw_lat: number;
    sw_lng: number;
    ne_lat: number;
    ne_lng: number;
  };
  formattedAddress?: string;
  error?: string;
}

interface FetchPOIsResult {
  success: boolean;
  totalFetched?: number;
  totalUpserted?: number;
  countsByType?: Record<string, number>;
  error?: string;
}

export function useGeoapify() {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isFetchingPOIs, setIsFetchingPOIs] = useState(false);

  const geocodeNeighborhood = async (
    neighborhoodId: string,
    neighborhoodName: string
  ): Promise<GeocodeResult> => {
    setIsGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke('geocode-neighborhood', {
        body: { neighborhoodId, neighborhoodName },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Geocoded ${neighborhoodName} successfully`);
      } else {
        toast.error(data.message || 'Failed to geocode neighborhood');
      }

      return data;
    } catch (error) {
      console.error('Geocode error:', error);
      toast.error('Failed to geocode neighborhood');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsGeocoding(false);
    }
  };

  const fetchNeighborhoodPOIs = async (
    neighborhoodId: string,
    latitude: number,
    longitude: number,
    radius?: number,
    categories?: string[]
  ): Promise<FetchPOIsResult> => {
    setIsFetchingPOIs(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-neighborhood-pois', {
        body: { neighborhoodId, latitude, longitude, radius, categories },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Fetched ${data.totalUpserted} POIs successfully`);
      } else {
        toast.error(data.message || 'Failed to fetch POIs');
      }

      return data;
    } catch (error) {
      console.error('Fetch POIs error:', error);
      toast.error('Failed to fetch POIs');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsFetchingPOIs(false);
    }
  };

  return {
    geocodeNeighborhood,
    fetchNeighborhoodPOIs,
    isGeocoding,
    isFetchingPOIs,
  };
}
