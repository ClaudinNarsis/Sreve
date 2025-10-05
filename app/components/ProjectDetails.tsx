'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './ProjectDetails.css';

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

interface ProjectDetailsProps {
  projectId: string;
  onClose: () => void;
  onProjectUpdate?: (project: Project) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId, onClose, onProjectUpdate }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'project' | 'campaigns'>('project');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [projectForm, setProjectForm] = useState({
    brand_name: '',
    offering: '',
    usp: '',
    icp: '',
    brand_voice: '',
    competitors: '',
    additional_information: ''
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    goal: '',
    platform: ''
  });

  useEffect(() => {
    fetchProjectData();
    fetchCampaigns();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (response.ok && data.project) {
        setProject(data.project);
        setProjectForm({
          brand_name: data.project.brand_name || '',
          offering: data.project.offering || '',
          usp: data.project.usp || '',
          icp: data.project.icp || '',
          brand_voice: data.project.brand_voice || '',
          competitors: data.project.competitors || '',
          additional_information: data.project.additional_information || ''
        });
      } else {
        toast.error('Failed to fetch project details');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Error loading project details');
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns?projectId=${projectId}`);
      const data = await response.json();

      if (response.ok && data.campaigns) {
        setCampaigns(data.campaigns);
        if (data.campaigns.length > 0) {
          setSelectedCampaignId(data.campaigns[0].campaignId);
          setCampaignForm({
            name: data.campaigns[0].name || '',
            description: data.campaigns[0].description || '',
            goal: data.campaigns[0].goal || '',
            platform: data.campaigns[0].platform || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Error loading campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaignId(campaign.campaignId);
    setCampaignForm({
      name: campaign.name || '',
      description: campaign.description || '',
      goal: campaign.goal || '',
      platform: campaign.platform || ''
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const saveToast = toast.loading('Saving changes...');

    try {
      // Convert project form to answers format expected by API
      const answers = {
        1: projectForm.brand_name,
        2: projectForm.offering,
        3: projectForm.usp,
        4: projectForm.brand_voice,
        5: projectForm.icp,
        6: projectForm.competitors,
        7: projectForm.additional_information
      };

      // Save project changes
      const projectResponse = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (!projectResponse.ok) {
        throw new Error('Failed to save project');
      }

      const projectData = await projectResponse.json();

      // Save campaign changes if a campaign is selected (if PUT method exists)
      if (selectedCampaignId && activeTab === 'campaigns') {
        try {
          const campaignResponse = await fetch(`/api/campaigns/${selectedCampaignId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(campaignForm)
          });

          if (!campaignResponse.ok) {
            // If PUT is not implemented, just log and continue
            console.log('Campaign editing not yet implemented');
          }
        } catch (error) {
          console.log('Campaign editing not yet available:', error);
        }
      }

      toast.success('Changes saved successfully!', { id: saveToast });

      // Update project state and notify parent
      if (projectData.project) {
        setProject(projectData.project);
        onProjectUpdate?.(projectData.project);
      }

      // Refresh campaigns
      await fetchCampaigns();

    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes', { id: saveToast });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    setSaving(true);
    const deleteToast = toast.loading('Deleting project...');

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Project deleted successfully!', { id: deleteToast });
        onClose();
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project', { id: deleteToast });
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const selectedCampaign = campaigns.find(c => c.campaignId === selectedCampaignId);

  if (loading && !project) {
    return (
      <div className="project-details-overlay">
        <div className="project-details-modal">
          <div className="loading-content">
            <p>Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-details-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="project-details-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2>{project?.brand_name || 'Project Details'}</h2>
            <p className="project-id">ID: {projectId}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'project' ? 'active' : ''}`}
            onClick={() => setActiveTab('project')}
          >
            Project Details
          </button>
          <button
            className={`tab-button ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            Campaigns ({campaigns.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'project' && (
            <div className="project-form">
              <div className="form-group">
                <label>Brand Name</label>
                <input
                  type="text"
                  value={projectForm.brand_name}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, brand_name: e.target.value }))}
                  placeholder="Enter brand name"
                />
              </div>

              <div className="form-group">
                <label>Offering</label>
                <textarea
                  value={projectForm.offering}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, offering: e.target.value }))}
                  placeholder="What does this brand offer?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Unique Selling Proposition (USP)</label>
                <textarea
                  value={projectForm.usp}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, usp: e.target.value }))}
                  placeholder="What makes this brand unique?"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Ideal Customer Profile (ICP)</label>
                <textarea
                  value={projectForm.icp}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, icp: e.target.value }))}
                  placeholder="Describe the ideal customer"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Brand Voice</label>
                <textarea
                  value={projectForm.brand_voice}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, brand_voice: e.target.value }))}
                  placeholder="Describe the brand's tone and voice"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Competitors</label>
                <textarea
                  value={projectForm.competitors}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, competitors: e.target.value }))}
                  placeholder="List main competitors"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label>Additional Information</label>
                <textarea
                  value={projectForm.additional_information}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, additional_information: e.target.value }))}
                  placeholder="Any additional context or information"
                  rows={4}
                />
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="campaigns-content">
              {campaigns.length === 0 ? (
                <div className="empty-state">
                  <p>No campaigns found for this project</p>
                </div>
              ) : (
                <div className="campaigns-layout">
                  {/* Campaign List */}
                  <div className="campaigns-list">
                    <h3>Campaigns</h3>
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.campaignId}
                        className={`campaign-card ${selectedCampaignId === campaign.campaignId ? 'selected' : ''}`}
                        onClick={() => handleCampaignSelect(campaign)}
                      >
                        <h4>{campaign.name}</h4>
                        <p className="campaign-description">{campaign.description}</p>
                        <div className="campaign-meta">
                          <span className="campaign-platform">{campaign.platform}</span>
                          <span className="campaign-date">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Campaign Details */}
                  {selectedCampaign && (
                    <div className="campaign-details">
                      <h3>Edit Campaign</h3>
                      <div className="form-group">
                        <label>Campaign Name</label>
                        <input
                          type="text"
                          value={campaignForm.name}
                          onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter campaign name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={campaignForm.description}
                          onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Campaign description"
                          rows={3}
                        />
                      </div>

                      <div className="form-group">
                        <label>Goal</label>
                        <input
                          type="text"
                          value={campaignForm.goal}
                          onChange={(e) => setCampaignForm(prev => ({ ...prev, goal: e.target.value }))}
                          placeholder="Campaign goal"
                        />
                      </div>

                      <div className="form-group">
                        <label>Platform</label>
                        <input
                          type="text"
                          value={campaignForm.platform}
                          onChange={(e) => setCampaignForm(prev => ({ ...prev, platform: e.target.value }))}
                          placeholder="Target platform"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-left">
            <button
              className="delete-button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
            >
              Delete Project
            </button>
          </div>
          <div className="footer-right">
            <button
              className="cancel-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="save-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>Delete Project</h3>
              <p>Are you sure you want to delete &quot;{project?.brand_name}&quot;?</p>
              <p className="warning-text">This will permanently delete the project and all associated campaigns. This action cannot be undone.</p>
              <div className="confirm-buttons">
                <button
                  className="confirm-cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="confirm-delete"
                  onClick={handleDeleteProject}
                  disabled={saving}
                >
                  {saving ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;