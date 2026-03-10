import { useState, useEffect } from 'react';
import { useBranch } from '@/hooks/use-branch';
import { useBranches } from '@/hooks/use-branches';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Building2, ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface BranchSelectorProps {
  collapsed?: boolean;
}

export function BranchSelector({ collapsed }: BranchSelectorProps) {
  const { currentBranch, setBranch } = useBranch();
  const { data: branches, isLoading } = useBranches();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Auto-select first branch if none selected
  useEffect(() => {
    if (!currentBranch && branches && branches.length > 0) {
      setBranch(branches[0]);
    }
  }, [branches, currentBranch, setBranch]);

  const filteredBranches = branches?.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedBranchName = currentBranch?.name ?? 'Select Branch';

  if (collapsed) {
    return (
      <div className="flex justify-center py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          title={selectedBranchName}
        >
          <span className="font-bold">{selectedBranchName.charAt(0)}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between gap-2 border-primary/20 bg-primary/5 px-3 hover:bg-primary/10 hover:text-primary"
            disabled={isLoading}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Building2 className="h-4 w-4 shrink-0 text-primary" />
              )}
              <span className="truncate text-sm font-medium">
                {isLoading ? 'Loading...' : selectedBranchName}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60 p-2" align="start">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Switch Branch
          </DropdownMenuLabel>
          <div className="px-2 py-1.5">
            <Input
              placeholder="Search branches..."
              className="h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-y-auto">
            {filteredBranches?.length === 0 && (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                No branches found
              </div>
            )}
            {filteredBranches?.map((branch) => (
              <DropdownMenuItem
                key={branch._id}
                onClick={() => setBranch(branch)}
                className={cn(
                  'flex items-center justify-between gap-2',
                  currentBranch?._id === branch._id && 'bg-primary/5 text-primary'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{branch.name}</span>
                  {branch.code && (
                    <span className="text-xs text-muted-foreground">
                      ({branch.code})
                    </span>
                  )}
                </div>
                {currentBranch?._id === branch._id && (
                  <Check className="h-4 w-4 shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
          {user?.role === 'super_admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setBranch(null)}>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>All Branches (Global View)</span>
                </div>
                {!currentBranch && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
