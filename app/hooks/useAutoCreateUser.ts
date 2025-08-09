'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function useAutoCreateUser() {
  const { user, isLoaded } = useUser();
  const [hasAttemptedCreation, setHasAttemptedCreation] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const createUserIfNotExists = async () => {
      if (!isLoaded || !user || hasAttemptedCreation || isCreating) {
        return;
      }

      console.log('🔍 Auto-checking if user exists in DynamoDB:', user.id);
      setIsCreating(true);
      setHasAttemptedCreation(true);

      try {
        // First, check if user already exists
        const checkResponse = await fetch('/api/users');
        console.log('🔍 Check user response status:', checkResponse.status);

        if (checkResponse.status === 200) {
          console.log('✅ User already exists in DynamoDB');
          setIsCreating(false);
          return;
        }

        if (checkResponse.status === 404) {
          console.log('👤 User not found in DynamoDB, creating...');
          
          // Create user automatically
          const createResponse = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userName: user.fullName || user.username || `${user.firstName} ${user.lastName}`.trim() || 'User',
              email: user.emailAddresses[0]?.emailAddress || '',
            }),
          });

          const data = await createResponse.json();
          console.log('🔄 Auto-create response:', data);

          if (createResponse.ok) {
            toast.success('🎉 Welcome! Your account has been set up.', {
              duration: 4000,
            });
            console.log('✅ User auto-created successfully:', data.user);
          } else if (createResponse.status === 409) {
            console.log('ℹ️ User already exists (race condition)');
          } else {
            console.error('❌ Failed to auto-create user:', data.error);
            toast.error('⚠️ Account setup incomplete. Please try refreshing.');
          }
        } else {
          console.error('❌ Error checking user existence:', checkResponse.status);
        }
      } catch (error) {
        console.error('❌ Error in auto user creation:', error);
        toast.error('⚠️ Account setup incomplete. Please try refreshing.');
      } finally {
        setIsCreating(false);
      }
    };

    createUserIfNotExists();
  }, [user, isLoaded, hasAttemptedCreation, isCreating]);

  return { isCreating };
}