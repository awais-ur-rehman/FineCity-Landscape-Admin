import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Branch {
  _id: string;
  name: string;
  code: string;
}

interface BranchStore {
  currentBranch: Branch | null;
  setBranch: (branch: Branch | null) => void;
}

export const useBranch = create<BranchStore>()(
  persist(
    (set) => ({
      currentBranch: null,
      setBranch: (branch) => set({ currentBranch: branch }),
    }),
    {
      name: 'fc_branch_storage',
    }
  )
);
