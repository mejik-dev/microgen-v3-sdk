import qs from 'qs';
import { STORAGE_KEY } from './lib/constants';
import hA from './lib/httpsAgent';
import {
  AuthResponseFailure,
  AuthResponse,
  ProfileResponse,
  TokenResponse,
  GetUserOption,
} from './lib/types';

class FailedHTTPResponse extends Error {
  public status: number;
  public statusText: string;
  public data: any;

  constructor(status: number, statusText: string, data: any = null) {
    super(`${status}: ${statusText}`);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export default class AuthClient {
  protected url: string;
  protected headers: { [key: string]: string };
  protected currentToken: string | null;

  constructor(
    url: string,
    { headers = {} }: { headers?: { [key: string]: string } } = {},
  ) {
    this.url = url;
    this.headers = { ...headers };
    this.currentToken = null;

    this._initToken();
  }

  private _error(error: any): AuthResponseFailure {
    if (error instanceof FailedHTTPResponse) {
      return {
        error: {
          message: error.data,
        },
        status: error.status,
        statusText: error.statusText,
      };
    }

    return {
      error: {
        message: 'failed',
      },
      status: 500,
      statusText: 'FAILED',
    };
  }

  private async _checkResponse(response: Response) {
    if (!response.ok) {
      throw new FailedHTTPResponse(
        response.status,
        response.statusText,
        await response.text(),
      );
    }

    return response;
  }

  private _filter<T = any>(option?: GetUserOption<T>): string {
    let query = '';
    if (option) {
      let filter: any = {};

      if (typeof option.lookup !== 'undefined') {
        filter['$lookup'] = option.lookup;
        delete option.lookup;
      }

      query = qs.stringify(filter, { encodeValuesOnly: true });
    }
    return query;
  }

  login<T = any>(body: {
    email: string;
    password: string;
  }): Promise<AuthResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const httpsAgent = await hA();
        const res = await this._checkResponse(
          await fetch(`${this.url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: httpsAgent,
          }),
        );
        const data = (await res.json()) as TokenResponse<T>;

        this.saveToken(data.token);
        const user = data.user;
        resolve({
          user,
          status: res.status,
          statusText: res.statusText,
          token: data.token,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  register<T = any>(
    body: Partial<T> & {
      firstName: string;
      lastName?: string;
      email: string;
      password: string;
      role?: string;
    },
  ): Promise<AuthResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const httpsAgent = await hA();
        const res = await this._checkResponse(
          await fetch(`${this.url}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: httpsAgent,
          }),
        );
        const data = (await res.json()) as TokenResponse<T>;

        this.saveToken(data.token);
        const user = data.user;
        resolve({
          user,
          status: res.status,
          statusText: res.statusText,
          token: data.token,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  user<T = any>(
    option?: GetUserOption<T>,
    token?: string,
  ): Promise<ProfileResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const query = this._filter(option);
        const httpsAgent = await hA();
        const res = await this._checkResponse(
          await fetch(`${this.url}/auth/user${query ? '?' + query : ''}`, {
            headers: token
              ? { ...this._headers(), Authorization: `Bearer ${token}` }
              : this._headers(),
            // @ts-expect-error
            dispatcher: httpsAgent,
          }),
        );
        const data = (await res.json()) as T;

        const user = data;
        resolve({
          user,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  update<T = any>(
    body: Partial<T>,
    token?: string,
  ): Promise<ProfileResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const httpsAgent = await hA();
        const res = await this._checkResponse(
          await fetch(`${this.url}/auth/user`, {
            method: 'PATCH',
            headers: token
              ? {
                  ...this._headers(),
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              : { ...this._headers(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: httpsAgent,
          }),
        );
        const data = (await res.json()) as T;

        const user = data;
        resolve({
          user,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  token() {
    return this.currentToken;
  }

  private _headers() {
    const headers: { [key: string]: string } = this.headers;
    const token = this.token();
    if (token && token !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  saveToken(token: string) {
    this.currentToken = token;
    this._setToken(token);
  }

  logout<T = any>(token?: string): Promise<AuthResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const httpsAgent = await hA();
        const res = await this._checkResponse(
          await fetch(`${this.url}/auth/logout`, {
            method: 'POST',
            headers: token
              ? { ...this._headers(), Authorization: `Bearer ${token}` }
              : this._headers(),
            // @ts-expect-error
            dispatcher: httpsAgent,
          }),
        );
        const data = (await res.json()) as TokenResponse<T>;

        this._removeToken();
        const user = data.user;
        resolve({
          user,
          status: res.status,
          statusText: res.statusText,
          token: data.token,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  verifyToken<T = any>(token?: string): Promise<AuthResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(`${this.url}/auth/verify-token`, {
            method: 'POST',
            headers: token
              ? { ...this._headers(), Authorization: `Bearer ${token}` }
              : this._headers(),
            // @ts-expect-error
            dispatcher: httpsAgent,
          }),
        );
        const data = (await res.json()) as TokenResponse<T>;

        const user = data.user;
        resolve({
          user,
          status: res.status,
          statusText: res.statusText,
          token: data.token,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  changePassword(
    body: {
      oldPassword: string;
      newPassword: string;
    },
    token?: string,
  ): Promise<{
    message?: string;
    error?: any;
    status: number;
    statusText: string;
  }> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(`${this.url}/auth/change-password`, {
            method: 'POST',
            headers: token
              ? {
                  ...this._headers(),
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              : { ...this._headers(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: httpsAgent,
          }),
        );
        const data = (await res.json()) as { message: string };

        const message = data.message;
        resolve({
          message,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve({
          error: {
            message: 'Failed',
          },
          status: 500,
          statusText: 'FAILED',
        });
      }
    });
  }

  private _setToken(token: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, token);
    }
  }

  private _removeToken() {
    this.currentToken = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  private _initToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = window.localStorage.getItem(STORAGE_KEY);
      if (token) {
        this.currentToken = token;
      }
    }
  }
}
