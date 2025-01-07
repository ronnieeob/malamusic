import { useState, useEffect } from 'react';
import { BandService } from '../../services/api/bandService';
import { MockService } from '../../services/mockService';
import { BandManagement } from '../../types/admin';
import { useApi } from '../useApi';

export function useBandManagement() {
  const bandService = new BandService();
  const mockService = new MockService();
  const [bands, setBands] = useState<BandManagement[]>([]);
  const isDev = import.meta.env.DEV;

  const {
    loading,
    error,
    execute: fetchBands
  } = useApi(
    async () => {
      if (isDev) {
        return mockService.getBands();
      }
      return bandService.getBands();
    },
    {
      onSuccess: (data) => setBands(data),
    }
  );

  useEffect(() => {
    fetchBands();
  }, []);

  const createBand = async (band: Omit<BandManagement, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBand = isDev 
      ? mockService.createBand(band)
      : await bandService.createBand(band);
    setBands(prev => [...prev, newBand]);
    return newBand;
  };

  const updateBand = async (id: string, updates: Partial<BandManagement>) => {
    const updatedBand = isDev
      ? mockService.updateBand(id, updates)
      : await bandService.updateBand(id, updates);
    setBands(prev => prev.map(band => band.id === id ? updatedBand : band));
    return updatedBand;
  };

  const deleteBand = async (id: string) => {
    if (isDev) {
      mockService.deleteBand(id);
    } else {
      await bandService.deleteBand(id);
    }
    setBands(prev => prev.filter(band => band.id !== id));
  };

  return {
    bands,
    loading,
    error,
    createBand,
    updateBand,
    deleteBand,
    refresh: fetchBands
  };
}