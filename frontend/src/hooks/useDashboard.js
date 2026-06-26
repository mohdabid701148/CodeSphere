import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncService } from '../services/syncService.js';
import { profileService } from '../services/profileService.js';

export const useDashboard = () => {
  const queryClient = useQueryClient();

  // Query to fetch dashboard statistics
  const dashboardQuery = useQuery({
    queryKey: ['dashboard'],
    queryFn: syncService.getDashboard,
  });

  // Mutation to trigger platform synchronization
  const syncMutation = useMutation({
    mutationFn: syncService.syncPlatform,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Mutation to update user details (slug, bio, headline, links)
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Mutation to toggle portfolio privacy visibility
  const privacyMutation = useMutation({
    mutationFn: profileService.togglePrivacy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    dashData: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
    syncMutation,
    updateProfileMutation,
    privacyMutation,
  };
};
