interface AuthResponseBase {
  status: number;
  statusText: string;
}

export interface AuthError {
  message: string;
}

export interface AuthResponseFailure extends AuthResponseBase {
  error?: AuthError;
  user?: null;
  token?: null;
}

export interface AuthResponseSuccess<T> extends AuthResponseBase {
  error?: AuthError;
  user: T;
  token: string;
}

export type AuthResponse<T> = AuthResponseSuccess<T> | AuthResponseFailure;

export interface TokenResponse<T> {
  token: string;
  user: T;
}

export interface AuthRegolResponseFailure extends AuthResponseBase {
  error?: AuthError;
  content?: null;
}

export interface AuthRegolResponseSuccess extends AuthResponseBase {
  error?: AuthError;
  content: string;
}

export type AuthRegolResponse =
  | AuthRegolResponseSuccess
  | AuthRegolResponseFailure;

export interface ProfileResponseSuccess<T> extends AuthResponseBase {
  error?: null;
  user?: T;
}

export type ProfileResponse<T> =
  | ProfileResponseSuccess<T>
  | AuthResponseFailure;

type LookupRecord =
  | string
  | string[]
  | Partial<
      Record<
        '*' | '_id',
        | string
        | (
            | string
            | Partial<
                Record<
                  string,
                  {
                    $select?: string[];
                    $lookup?: LookupRecord;
                  }
                >
              >
          )[]
      >
    >;

type Lookup<T> =
  | '*'
  | keyof T
  | (keyof T)[]
  | Partial<
      Record<
        '*' | '_id',
        | '*'
        | keyof T
        | (
            | keyof T
            | Partial<
                Record<
                  keyof T,
                  {
                    $select?: string[];
                    $lookup?: LookupRecord;
                  }
                >
              >
          )[]
      >
    >;

export interface GetUserOption<T> {
  lookup?: Lookup<T>;
}
