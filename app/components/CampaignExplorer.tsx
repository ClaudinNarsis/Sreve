import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './CampaignExplorer.css';

interface Campaign {
  campaignId: string;
  projectId: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

interface CampaignExplorerProps {
  campaignId: string | null;
}

const CampaignExplorer: React.FC<CampaignExplorerProps> = ({ campaignId }) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setCampaign(null);
      setLoading(false);
      return;
    }

    const fetchCampaignDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const data = await response.json();

        if (response.ok && data.campaign) {
          setCampaign(data.campaign);
        } else {
          setError(data.error || 'Failed to fetch campaign details');
          toast.error(data.error || 'Failed to fetch campaign details');
        }
      } catch (err) {
        setError('Error fetching campaign details');
        toast.error('Error fetching campaign details');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetails();
  }, [campaignId]);

  if (!campaignId) {
    return (
      <div className="campaign-explorer">
        <div className="empty-state">
          <p>Select a campaign to view details</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="campaign-explorer">
        <div className="loading-state">
          <p>Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaign-explorer">
        <div className="error-state">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="campaign-explorer">
        <div className="empty-state">
          <p>Campaign not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-explorer">
      <div className="explorer-header">
        <h3>Campaign Details</h3>
      </div>
      <div className="campaign-details">
        <p><strong>Name:</strong> {campaign.name}</p>
        <p><strong>Description:</strong> {campaign.description || 'N/A'}</p>
        <p><strong>Status:</strong> {campaign.status}</p>
        <p><strong>Created At:</strong> {new Date(campaign.createdAt).toISOString()}</p>
        <p><strong>Updated At:</strong> {new Date(campaign.updatedAt).toISOString()}</p>
      </div>
    </div>
  );
};

export default CampaignExplorer;
