'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function UserCreationTest() {
  const { user, isLoaded } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const createUser = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsCreating(true);
    const loadingToast = toast.loading('Creating user in DynamoDB...');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: user.fullName || user.username || `${user.firstName} ${user.lastName}`.trim() || 'User',
          email: user.emailAddresses[0]?.emailAddress || '',
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success('✅ User created successfully in DynamoDB!');
        console.log('User created:', data.user);
      } else if (response.status === 409) {
        toast.error('⚠️ User already exists in DynamoDB');
      } else {
        toast.error(`❌ Failed to create user: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.dismiss(loadingToast);
      toast.error('❌ Network error while creating user');
    } finally {
      setIsCreating(false);
    }
  };

  const fetchUser = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsFetching(true);
    const loadingToast = toast.loading('Fetching user from DynamoDB...');

    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      console.log('Fetch API Response:', data);

      toast.dismiss(loadingToast);

      if (response.ok) {
        toast.success('✅ User found in DynamoDB!');
        console.log('User data:', data.user);
      } else if (response.status === 404) {
        toast.error('❌ User not found in DynamoDB');
      } else {
        toast.error(`❌ Failed to fetch user: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.dismiss(loadingToast);
      toast.error('❌ Network error while fetching user');
    } finally {
      setIsFetching(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to test user creation</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>User Creation Test Panel</h3>
      <p><strong>Current User:</strong> {user.fullName || user.username}</p>
      <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
      <p><strong>Clerk ID:</strong> {user.id}</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button 
          onClick={createUser}
          disabled={isCreating}
          style={{
            padding: '10px 15px',
            backgroundColor: isCreating ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isCreating ? 'not-allowed' : 'pointer'
          }}
        >
          {isCreating ? 'Creating...' : 'Create User in DynamoDB'}
        </button>

        <button 
          onClick={fetchUser}
          disabled={isFetching}
          style={{
            padding: '10px 15px',
            backgroundColor: isFetching ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isFetching ? 'not-allowed' : 'pointer'
          }}
        >
          {isFetching ? 'Fetching...' : 'Check if User Exists'}
        </button>
      </div>
    </div>
  );
}