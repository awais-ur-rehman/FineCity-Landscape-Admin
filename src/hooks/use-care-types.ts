import { CARE_TYPES } from '@/lib/constants';
import { capitalize } from '@/lib/utils';

export interface CareType {
  _id: string;   // equals the care type string, e.g. 'watering'
  name: string;  // display name, e.g. 'Watering'
  isActive: boolean;
}

/** Returns static care types derived from the CARE_TYPES constant. */
export function useCareTypes() {
  const data: CareType[] = CARE_TYPES.map((ct) => ({
    _id: ct,
    name: capitalize(ct.replace('_', ' ')),
    isActive: true,
  }));

  return { data, isLoading: false, error: null };
}
