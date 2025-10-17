'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface Project {
  projectId: string;
  userId: string;
  brand_name: string;
  offering: string;
  usp: string;
  icp: string;
  brand_voice: string;
  competitors: string;
  additional_information: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface Campaign {
  campaignId: string;
  projectId: string;
  userId: string;
  name: string;
  description: string;
  goal: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface ProjectExplorerProps {
  onCampaignSelect: (campaignId: string | null, projectId: string | null) => void;
  selectedCampaignId: string | null;
  onCreateProjectClick: () => void;
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
}

export interface ProjectExplorerRef {
  refreshData: () => void;
  refreshCampaigns: (projectId: string) => void;
}

const ProjectExplorer = forwardRef<ProjectExplorerRef, ProjectExplorerProps>(({ onCampaignSelect, selectedCampaignId, onCreateProjectClick, selectedProjectId, onProjectSelect }, ref) => {
  const { user, isLoaded } = useUser();
  // const router = useRouter(); // Currently unused
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, Campaign[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [loadingCampaigns, setLoadingCampaigns] = useState<Set<string>>(new Set());
  const [creatingCampaign, setCreatingCampaign] = useState<string | null>(null);
  const [, setSelectedProject] = useState<string | null>(null);

  // Define fetch functions with useCallback
  const fetchProjects = useCallback(async () => {
    console.log('🔍 Fetching user projects...');
    setLoading(true);

    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/projects?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      console.log('📋 Projects response:', data);

      if (response.ok && data.success) {
        setProjects(data.projects || []);
        console.log('✅ Projects loaded:', data.projects?.length || 0);
      } else {
        console.error('❌ Failed to fetch projects:', data.error);
        toast.error('Failed to load projects');
      }
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      toast.error('Error loading projects');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCampaigns = useCallback(async (projectId: string) => {
    console.log('🔍 [FETCH-CAMPAIGNS] Starting fetchCampaigns for project:', projectId);
    console.log('🔍 [FETCH-CAMPAIGNS] Current campaigns state:', campaigns);
    setLoadingCampaigns(prev => new Set([...prev, projectId]));

    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = `/api/campaigns?projectId=${projectId}&t=${timestamp}`;
      console.log('🔍 [FETCH-CAMPAIGNS] Fetching from URL:', url);

      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('🔍 [FETCH-CAMPAIGNS] Response status:', response.status);
      const data = await response.json();
      console.log('📋 [FETCH-CAMPAIGNS] Campaigns response data:', data);
      console.log('📋 [FETCH-CAMPAIGNS] Number of campaigns:', data.campaigns?.length || 0);

      if (response.ok && data.success) {
        const newCampaignsState = {
          ...campaigns,
          [projectId]: data.campaigns || []
        };
        console.log('📋 [FETCH-CAMPAIGNS] Setting new campaigns state:', newCampaignsState);

        setCampaigns(prev => {
          const updated = {
            ...prev,
            [projectId]: data.campaigns || []
          };
          console.log('📋 [FETCH-CAMPAIGNS] State update - prev:', prev, 'updated:', updated);
          return updated;
        });

        console.log('✅ [FETCH-CAMPAIGNS] Campaigns loaded for project:', projectId, 'count:', data.campaigns?.length || 0);

        // Log campaign names for debugging
        if (data.campaigns && data.campaigns.length > 0) {
          console.log('✅ [FETCH-CAMPAIGNS] Campaign names:', data.campaigns.map((c: { name: string }) => c.name));
        }
      } else {
        console.error('❌ [FETCH-CAMPAIGNS] Failed to fetch campaigns:', data.error);
        toast.error('Failed to load campaigns');
      }
    } catch (error) {
      console.error('❌ [FETCH-CAMPAIGNS] Error fetching campaigns:', error);
      toast.error('Error loading campaigns');
    } finally {
      setLoadingCampaigns(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
      console.log('✅ [FETCH-CAMPAIGNS] Finished fetchCampaigns for project:', projectId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjects();
    }
  }, [isLoaded, user, fetchProjects]);

  // Add effect to refresh data when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isLoaded && user) {
        console.log('🔄 Page became visible, refreshing projects...');
        fetchProjects();
      }
    };

    const handleFocus = () => {
      if (isLoaded && user) {
        console.log('🔄 Window focused, refreshing projects...');
        fetchProjects();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLoaded, user, fetchProjects]);

  // Listen to pathname changes to refresh data when navigating back to /app
  useEffect(() => {
    if (pathname === '/app' && isLoaded && user) {
      console.log('🔄 Navigated to /app, refreshing projects...');
      fetchProjects();
    }
  }, [pathname, isLoaded, user, fetchProjects]);

  // Expose refresh methods to parent components
  useImperativeHandle(ref, () => {
    console.log('🔄 [PROJECT-EXPLORER] useImperativeHandle creating ref methods');
    console.log('🔄 [PROJECT-EXPLORER] isLoaded:', isLoaded, 'user:', !!user);
    console.log('🔄 [PROJECT-EXPLORER] fetchProjects exists:', typeof fetchProjects);
    console.log('🔄 [PROJECT-EXPLORER] fetchCampaigns exists:', typeof fetchCampaigns);

    return {
      refreshData: () => {
        console.log('🔄 [PROJECT-EXPLORER] refreshData called');
        console.log('🔄 [PROJECT-EXPLORER] isLoaded:', isLoaded, 'user:', !!user);
        if (isLoaded && user) {
          console.log('🔄 [PROJECT-EXPLORER] Calling fetchProjects...');
          fetchProjects();
        } else {
          console.log('⚠️ [PROJECT-EXPLORER] Cannot refresh - user not loaded');
        }
      },
      refreshCampaigns: (projectId: string) => {
        console.log('🔄 [PROJECT-EXPLORER] refreshCampaigns called for project:', projectId);
        console.log('🔄 [PROJECT-EXPLORER] isLoaded:', isLoaded, 'user:', !!user);
        if (isLoaded && user) {
          console.log('🔄 [PROJECT-EXPLORER] Calling fetchCampaigns...');
          fetchCampaigns(projectId);
        } else {
          console.log('⚠️ [PROJECT-EXPLORER] Cannot refresh campaigns - user not loaded');
        }
      }
    };
  }, [isLoaded, user, fetchProjects, fetchCampaigns]);

  const toggleProject = (projectId: string) => {
    const wasExpanded = expandedProjects.has(projectId);

    setExpandedProjects(prev => {
      const newSet = new Set<string>();
      if (!prev.has(projectId)) {
        // Only add the current project, ensuring single selection
        newSet.add(projectId);
      }
      // If the project was expanded, newSet remains empty (collapses all)
      return newSet;
    });

    // Handle state updates and callbacks after the main state update
    // Use setTimeout to ensure these happen in the next tick
    setTimeout(() => {
      if (wasExpanded) {
        setSelectedProject(null);
        onProjectSelect(null); // Deselect project in parent
      } else {
        setSelectedProject(projectId);
        onProjectSelect(projectId); // Select project in parent
        // Fetch campaigns when expanding
        if (!campaigns[projectId]) {
          fetchCampaigns(projectId);
        }
      }
    }, 0);
  };

  const getProjectName = (project: Project) => {
    // Get project name from answers (step 1 is usually project name)
    return project.brand_name || `Project ${project.projectId.slice(0, 8)}`;
  };

  const handleCreateProject = () => {
    console.log('🔄 Triggering create project click...');
    onCreateProjectClick();
  };

  const handleCampaignClick = (campaignId: string, projectId: string) => {
    onCampaignSelect(campaignId, projectId);
  };

  const handleCreateCampaign = async (projectId: string) => {
    const campaignName = 'New Campaign';

    console.log('🔄 Creating campaign for project:', projectId);
    setCreatingCampaign(projectId);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          name: campaignName,
          description: ''
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Campaign created:', data.campaign);
        toast.success('Campaign created successfully!');
        // Refresh campaigns for this project
        await fetchCampaigns(projectId);
        // Automatically select the new campaign to show Campaign Explorer
        onCampaignSelect(data.campaign.campaignId, projectId);
      } else {
        console.error('❌ Failed to create campaign:', data.error);
        toast.error(data.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('❌ Error creating campaign:', error);
      toast.error('Error creating campaign');
    } finally {
      setCreatingCampaign(null);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="explorer-loading">
        <div>Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="project-explorer">
      {projects.length > 0 && (
        <div className="project-tree">
          {projects.map((project) => {
            const isExpanded = expandedProjects.has(project.projectId);
            const projectCampaigns = campaigns[project.projectId] || [];
            const isLoadingCampaigns = loadingCampaigns.has(project.projectId);

            return (
              <div key={project.projectId} className={`project-item ${selectedProjectId === project.projectId ? 'selected' : ''}`}>
                <div
                  className="project-header"
                  onClick={() => toggleProject(project.projectId)}
                >
                  <svg
                    className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                  <span className="project-name">{getProjectName(project)}</span>
                  <button
                          className="create-btn small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateCampaign(project.projectId);
                          }}
                          disabled={creatingCampaign === project.projectId}
                          title="Create New Campaign"
                        >
                          {creatingCampaign === project.projectId ? '...' : '+'}
                        </button>
                </div>

                {isExpanded && (
                  <div className="project-content">
                    <div className="campaigns-section">
                      

                      {isLoadingCampaigns ? (
                        <div className="loading-item">Loading campaigns...</div>
                      ) : projectCampaigns.length === 0 ? (
                        <div className="empty-campaigns">No campaigns yet</div>
                      ) : (
                        <div className="campaigns-list">
                          {projectCampaigns.map((campaign) => (
                            <div
                              key={campaign.campaignId}
                              className={`campaign-item ${selectedCampaignId === campaign.campaignId ? 'selected' : ''}`}
                              onClick={() => handleCampaignClick(campaign.campaignId, campaign.projectId)}
                            >
                              <span className="campaign-name">{campaign.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

ProjectExplorer.displayName = 'ProjectExplorer';

export default ProjectExplorer;