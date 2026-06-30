export type AuthUser = {
  avatarUrl: string | null;
  createdAt: string;
  email: string | null;
  id: string;
  login: string;
  name: string;
  updatedAt: string;
  yandexId: string;
};

export type YandexUserInfo = {
  client_id?: string;
  default_avatar_id?: string;
  default_email?: string;
  display_name?: string;
  emails?: string[];
  first_name?: string;
  id: string;
  last_name?: string;
  login: string;
  psuid?: string;
  real_name?: string;
};
