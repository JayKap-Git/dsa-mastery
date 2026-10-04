export interface SessionUser {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string | null;
  seq: number;
}

export type AppEnv = {
  Bindings: Env;
  Variables: { user: SessionUser };
};
