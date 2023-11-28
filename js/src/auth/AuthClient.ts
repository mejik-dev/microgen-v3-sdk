import axios from 'axios';
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
    if (axios.isAxiosError(error) && error.response) {
      return {
        error: {
          message: (error.response.data as any)?.message
            ? (error.response.data as any).message
            : typeof error.response.data === 'object'
            ? JSON.stringify(error.response.data)
            : String(error.response.data),
        },
        status: error.response.status,
        statusText: error.response.statusText,
      };
    }

    return {
      error: {
        message: 'Failed',
      },
      status: 500,
      statusText: 'FAILED',
    };
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

  async login<T = any>(body: {
    email: string;
    password: string;
  }): Promise<AuthResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.post<TokenResponse<T>>(
          `${this.url}/auth/login`,
          body,
          { httpsAgent },
        );

        this.saveToken(data.token);
        const user = data.user;
        resolve({
          user,
          status,
          statusText,
          token: data.token,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async register<T = any>(body: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.post<TokenResponse<T>>(
          `${this.url}/auth/register`,
          body,
          { httpsAgent },
        );

        this.saveToken(data.token);
        const user = data.user;
        resolve({
          user,
          status,
          statusText,
          token: data.token,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async user<T = any>(
    option?: GetUserOption<T>,
    token?: string,
  ): Promise<ProfileResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const query = this._filter(option);
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.get<T>(
          `${this.url}/auth/user${query ? '?' + query : ''}`,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this._headers(),
            httpsAgent,
          },
        );

        const user = data;
        resolve({
          user,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async update<T = any>(
    body: Partial<T>,
    token?: string,
  ): Promise<ProfileResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.patch<T>(
          `${this.url}/auth/user`,
          body,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this._headers(),
            httpsAgent,
          },
        );

        const user = data;
        resolve({
          user,
          status,
          statusText,
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
    const authBearer = this.token();
    if (authBearer && authBearer !== '') {
      headers['Authorization'] = `Bearer ${authBearer}`;
    }
    return headers;
  }

  saveToken(token: string) {
    this.currentToken = token;
    this._setToken(token);
  }

  async logout<T = any>(token?: string): Promise<AuthResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.post<TokenResponse<T>>(
          `${this.url}/auth/logout`,
          null,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this._headers(),
            httpsAgent,
          },
        );

        this._removeToken();
        const user = data.user;
        resolve({
          user,
          status,
          statusText,
          token: data.token,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async verifyToken<T = any>(token?: string): Promise<AuthResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const { data, status, statusText } = await axios.post<TokenResponse<T>>(
          `${this.url}/auth/verify-token`,
          null,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this._headers(),
          },
        );

        const user = data.user;
        resolve({
          user,
          status,
          statusText,
          token: data.token,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async changePassword(
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
    return new Promise(async (resolve, _reject) => {
      try {
        const { data, status, statusText } = await axios.post<{
          message: string;
        }>(`${this.url}/auth/change-password`, body, {
          headers: token
            ? { authorization: `Bearer ${token}` }
            : this._headers(),
        });

        const message = data.message;
        resolve({
          message,
          status,
          statusText,
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
