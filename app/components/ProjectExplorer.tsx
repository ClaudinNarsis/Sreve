'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Project {
  projectId: string;
  userId: string;
  answers: Record<string, any>;
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

export default function ProjectExplorer({ onCampaignSelect, selectedCampaignId, onCreateProjectClick, selectedProjectId, onProjectSelect }: ProjectExplorerProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, Campaign[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [loadingCampaigns, setLoadingCampaigns] = useState<Set<string>>(new Set());
  const [creatingCampaign, setCreatingCampaign] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjects();
    }
  }, [isLoaded, user]);

  const fetchProjects = async () => {
    console.log('🔍 Fetching user projects...');
    setLoading(true);

    try {
      const response = await fetch('/api/projects');
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
  };

  const fetchCampaigns = async (projectId: string) => {
    console.log('🔍 Fetching campaigns for project:', projectId);
    setLoadingCampaigns(prev => new Set([...prev, projectId]));

    try {
      const response = await fetch(`/api/campaigns?projectId=${projectId}`);
      const data = await response.json();
      console.log('📋 Campaigns response:', data);

      if (response.ok && data.success) {
        setCampaigns(prev => ({
          ...prev,
          [projectId]: data.campaigns || []
        }));
        console.log('✅ Campaigns loaded for project:', projectId, data.campaigns?.length || 0);
      } else {
        console.error('❌ Failed to fetch campaigns:', data.error);
        toast.error('Failed to load campaigns');
      }
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
      toast.error('Error loading campaigns');
    } finally {
      setLoadingCampaigns(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
        setSelectedProject(null);
        onProjectSelect(null); // Deselect project in parent
      } else {
        newSet.add(projectId);
        setSelectedProject(projectId);
        onProjectSelect(projectId); // Select project in parent
        // Fetch campaigns when expanding
        if (!campaigns[projectId]) {
          fetchCampaigns(projectId);
        }
      }
      return newSet;
    });
  };

  const getProjectName = (project: Project) => {
    // Get project name from answers (step 1 is usually project name)
    return project.answers?.[1] || `Project ${project.projectId.slice(0, 8)}`;
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
      <div className="explorer-header">
        <h3>Projects</h3>
        <button 
          className="create-btn" 
          onClick={handleCreateProject}
          title="Create New Project"
        >
          +
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet</p>
          <button className="create-project-btn" onClick={handleCreateProject}>
            Create Your First Project
          </button>
        </div>
      ) : (
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
                    className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                    width="16" height="16" viewBox="0 0 24 24"
                  >
                    <polyline points="9,6 15,12 9,18"></polyline>
                  </svg>
                  <svg className="project-icon" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"></path>
                  </svg>
                  <span className="project-name">{getProjectName(project)}</span>
                </div>

                {isExpanded && (
                  <div className="project-content">
                    <div className="campaigns-section">
                      <div className="section-header">
                        <span>Campaigns</span>
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
                              <svg className="campaign-icon" width="14" height="14" viewBox="0 0 24 24">
                                <path d="M9 2v6h6V2"></path>
                                <path d="M9 18H5a2 2 0 01-2-2v-5h18v5a2 2 0 01-2 2h-4"></path>
                                <path d="M5 8h14"></path>
                              </svg>
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
}