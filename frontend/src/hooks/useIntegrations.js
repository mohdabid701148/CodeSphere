import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationService } from '../services/integrationService.js';

export const useIntegrations = () => {
  const queryClient = useQueryClient();

  // Query to fetch linked handles list
  const integrationsQuery = useQuery({
    queryKey: ['integrations'],
    queryFn: integrationService.getStatus,
  });

  // Mutation to connect platform handle
  const connectMutation = useMutation({
    mutationFn: ({ platform, username }) => integrationService.connect(platform, username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  // Mutation to disconnect integration
  const disconnectMutation = useMutation({
    mutationFn: (platform) => integrationService.disconnect(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  return {
    connections: integrationsQuery.data || [],
    isLoading: integrationsQuery.isLoading,
    error: integrationsQuery.error,
    refetch: integrationsQuery.refetch,
    connectMutation,
    disconnectMutation,
  };
};
