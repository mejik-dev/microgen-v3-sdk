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

type FieldLookup<T> = {
  [P in keyof Partial<T> | string]:
    | {
        ['$lookup']: AuthLookup<Record<string, unknown>>;
      }
    | '*';
};

export interface AuthLookup<T> {
  '*'?: (FieldLookup<T> | keyof T)[];
  _id?: (FieldLookup<T> | keyof T | '*')[];
}

export interface GetUserOption<T> {
  lookup?: (keyof Partial<T>)[] | '*' | AuthLookup<T>;
}
