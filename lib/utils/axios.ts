// axiosConfig.js

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:
    // process.env.NODE_ENV === 'production' ? String(process.env.NEXT_PUBLIC_BACKEND_URL_PROD) : 'http://localhost:3000/',
    String(process.env.NEXT_PUBLIC_BACKEND_URL_PROD),
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true
});

export const axiosSocket = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production' ? String(process.env.SOCKET_URL_PROD) : String(process.env.SOCKET_URL),
})

export enum SOCKET {
  CONNECT = 'connect'
}

export enum API {
  // auth
  AUTH = 'api/v1/auth',
  GOOGLE_LOGIN = 'api/v1/auth/google/login',
  LOGOUT = 'api/logout',
  // App
  DEPLOY_APP = 'api/v1/apps',
  GET_APPS = 'api/v1/apps',
  // items
  GET_HOSTS = 'api/v1/hosts',
  // base
  GET_BASE_METADATA = 'api/v1/base/metadata',
  GET_BASE_TOKEN = 'api/v1/iam/login',
  ACQUIRE_BASE = 'api/v1/session/acquire',
  RELINQUISH_ITEM = 'api/v1/session/acquire',
  UPDATE_BASE = 'api/v1/base/update',
  POST_BASE = 'api/v1/base/create',
  JOIN_BASE = 'api/v1/base/join',
  LEAVE_BASE = 'api/v1/base/leave',
  INVITE_MEMBER = 'api/v1/base/invite',
  ADD_MEMBERS = 'api/v1/base/addMember',
  // event
  GET_EVENT_COUNTS = 'api/v1/events/dates',
  GET_EVENT = 'api/v1/event',
  DELETE_EVENT = 'api/v1/events',
  GET_EVENT_METADATA = 'api/v1/events/metadata',
  GET_EVENT_SERIES = 'api/v1/event/series',
  POST_EVENT = 'api/v1/events',
  UPDATE_EVENT = 'api/v1/events',
  PATCH_SERIES = 'api/v1/event/updateSeries',
  SEARCH_EVENTS = 'api/v1/event/search',
  SAVE_EVENT = "api/v1/event/save",
  CHANGE_EVENT_STATUS = "api/v1/events",
  UPDATE_EVENT_CHILDREN_ORDER = "api/v1/event/children",
  // events
  GET_EVENTS = 'api/v1/events',
  // location
  GET_LOCATIONS = 'api/v1/locations',
  DELETE_LOCATIONS = 'api/v1/locations',
  UPDATE_LOCATION = 'api/v1/locations',
  POST_LOCATION = 'api/v1/locations/create',
  SEARCH_LOCATIONS = 'api/v1/locations/search',
  // media
  CONVERT_TO_WEBP = 'api/v1/media/convertToWebp',
  GET_SECURE_MEDIA_URL = '/api/v1/media/secure_url',
  // people
  GET_IAM = 'api/v1/iam',
  POST_IAM_INVITE = 'api/v1/iam/invite',
  GET_PEOPLE = 'api/v1/people',
  REMOVE_PEOPLE = 'api/v1/people/remove',
  REGISTER_PROFILE = 'api/v1/people/register',
  // profile
  SEARCH_PROFILES = 'api/v1/profile/search',
  // series
  GET_EVENTS_AND_SERIES = 'api/v1/series',
  GET_SERIES = 'api/v1/series',
  DELETE_SERIES = 'api/v1/series',
  POST_SERIES = 'api/v1/series/create',
  SEARCH_SERIES = 'api/v1/series/search',
  SERIES_METADATA = 'api/v1/series/metadata',
  UPDATE_SERIES = 'api/v1/series',
  // session
  LOGIN = 'api/login',
  VERIFY_SESSION_TOKEN = '/api/v1/session/me',
  // certificates
  GET_CERTIFICATES = 'api/v1/certificate',
  POST_CERTIFICATE = 'api/v1/certificate/create',
  // host
  PATCH_HOST = 'api/v1/hosts',
  // OTHER
  GET_NOTIFICATIONS = 'api/v1/notifications',
}

export default axiosInstance;
