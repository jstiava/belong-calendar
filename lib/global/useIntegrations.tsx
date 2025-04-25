"use client"
import { useEffect, useState } from 'react';
import axios from '@/lib/utils/axios';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/router';
import { Profile } from '@/schema';
import dayjs from '@/lib/utils/dayjs';
import { log } from 'node:console';
import { KeyboardReturnOutlined } from '@mui/icons-material';
import { API } from '../utils/axios';
import { Dayjs } from 'dayjs';

interface Integration {
  token_type: string;
  scope: string;
  access_token: string;
  expires_on: Dayjs;
  id_token?: string;
  refresh_token: string;
}

interface GoogleIdToken {
  at_hash: string;
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  name: string;
  picture: string;
  sub: string;
}

export interface UseIntegrations {
  get: (serviceKey: string) => Promise<string | null>;
  set: (serviceKey: string, payload: any) => void | null;
  login: (serviceKey: string) => Promise<string | null>;
  refresh: (serviceKey: string) => Promise<string | null>;
  getExpiration: (serviceKey: string) => Dayjs | null;
  remove: (serviceKey: string) => void;
  list: { [key: string]: Integration } | null;
}

export default function useIntegrations(session: Profile | null): UseIntegrations {
  const router = useRouter();

  const [cacheID, setCacheID] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<{
    [key: string]: Integration;
  } | null>(null);

  const fetchIntegrations = async () => {
    if (!session) return;
    setIntegrations({});
    // await axios
    //   .get(API.AUTH)
    //   .then(res => {
    //     // const initialIntegrations = new Map<string, Integration>(res.data.integrations);
    //     setCacheID(session.uuid);
    //     const { username, ...theIntegrations } = res.data.integrations;
    //     setIntegrations(theIntegrations);
    //   })
    //   .catch(error => {
    //     enqueueSnackbar('Could not get integrations.', {
    //       variant: 'error',
    //     });
    //   });
  };

  useEffect(() => {
    if (!session) return;
    if (integrations && session.uuid === cacheID) return;
    fetchIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const refreshServiceToken = async (serviceKey: string): Promise<any | null> => {
    if (!integrations) return;

    console.log("Call for refresh")
    return axios
      .post(`${API.AUTH}/${serviceKey}/refresh`)
      .then(res => {
        console.log('refreshed', res.data.refreshed);
        set(serviceKey, res.data.refreshed)
        return res.data.refreshed;
      })
      .catch(error => {
        console.log('Could not refresh token.', error);
        return null;
      });
  };

  const refresh = async (serviceKey: string): Promise<string | null> => {
    console.log("--- refreshing ---")
    let service = null;

    service = await refreshServiceToken(serviceKey);
    if (!service) {
      console.log('No service found after trying to refresh. Logging in.');
      login(serviceKey);
      return null;
    }

    return service.access_token;
  };

  const set = (serviceKey: string, payload: any): void | null => {
    if (!payload) {
      console.log("Payload invalid.")
      return;
    }
    if (!integrations) {
      setIntegrations({ [serviceKey]: payload });
      return;
    };
    setIntegrations(prev => ({
      ...prev,
      [serviceKey]: payload,
    }));
  };

  const get = async (serviceKey: string): Promise<string | null> => {
    console.log("--- useIntegrations.get ---")
    if (!integrations) {
      console.log('No integrations');
      return login(serviceKey);
    }

    let service = integrations[serviceKey];

    if (!service) {
      console.log('No service exists under that name', serviceKey);
      return login(serviceKey);
    }

    if (dayjs().isBefore(dayjs(service.expires_on))) {
      console.log("Token found.")
      return service.access_token;
    }
    console.log("Is expired.")
    console.log(dayjs(service.expires_on))
    return await refresh(serviceKey);
  };

  const login = async (serviceKey: string): Promise<string | null> => {
    window.open(`/api/v2/auth/${serviceKey}/login`, '_blank');
    return null;
  };

  const getExpiration = (serviceKey: string): Dayjs | null => {
    if (!integrations) return null;

    let service = integrations[serviceKey];
    if (!service) return null;

    return service.expires_on;
  };

  const remove = (serviceKey: string) => {
    if (!integrations) return;

    setIntegrations(prev => {
      const updatedIntegrations = { ...prev };
      delete updatedIntegrations[serviceKey];
      return prev;
    });
  };

  return {
    get,
    set,
    login,
    refresh,
    getExpiration,
    remove,
    list: integrations
  };
}
