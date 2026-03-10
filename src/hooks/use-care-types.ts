import { useQuery } from '@tanstack/react-query';

export interface CareType {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export function useCareTypes() {
  // Currently fetching from hardcoded constants as there is no API endpoint for care types yet
  // This is a placeholder for future implementation
  return useQuery({
    queryKey: ['care-types'],
    queryFn: async () => {
      // Mock API call
      return [
        { _id: '1', name: 'Watering', description: 'Regular watering schedule', isActive: true },
        { _id: '2', name: 'Fertilizer', description: 'Nutrient application', isActive: true },
        { _id: '3', name: 'Pruning', description: 'Trimming and shaping', isActive: true },
        { _id: '4', name: 'Repotting', description: 'Moving to larger pots', isActive: true },
        { _id: '5', name: 'General', description: 'General maintenance', isActive: true },
      ] as CareType[];
    },
  });
}
