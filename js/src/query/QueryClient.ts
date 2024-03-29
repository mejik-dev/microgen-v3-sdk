import axios from 'axios';
import qs from 'qs';
import { FieldClient } from '../field';
import {
  MicrogenResponse,
  MicrogenResponseFailure,
  MicrogenSingleResponse,
  FindOption,
  QueryClientOption,
  MicrogenCount,
  MicrogenResponseCount,
  CountOption,
  GetByIdOption,
} from './lib/types';
import hA from './lib/httpsAgent';

export default class QueryClient<T> {
  protected url: string;
  protected headers: { [key: string]: string };

  public field: FieldClient<T>;

  constructor(tableName: string, options: QueryClientOption) {
    this.url = `${options.url}/${tableName}`;
    this.headers = { ...options.headers };
    this.field = new FieldClient<T>(
      `${options.url}/tables/${tableName}`,
      options,
    );
  }

  private _error(error: any): MicrogenResponseFailure {
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

  private _filter(option?: FindOption<T>): string {
    let query = '';
    if (option) {
      let filter: any = {};
      if (typeof option.skip !== 'undefined') {
        filter['$skip'] = option.skip;
        delete option.skip;
      }

      if (typeof option.limit !== 'undefined') {
        filter['$limit'] = option.limit;
        delete option.limit;
      }

      if (typeof option.sort !== 'undefined') {
        filter['$sort'] = option.sort;
        delete option.sort;
      }

      if (typeof option.select !== 'undefined') {
        filter['$select'] = option.select;
        delete option.select;
      }

      if (typeof option.lookup !== 'undefined') {
        filter['$lookup'] = option.lookup;
        delete option.lookup;
      }

      if (typeof option.or !== 'undefined') {
        filter['$or'] = option.or;
        delete option.or;
      }

      if (typeof option.where !== 'undefined') {
        filter = {
          ...filter,
          ...option.where,
        };
      }

      query = qs.stringify(filter, { encodeValuesOnly: true });
    }
    return query;
  }

  async find(
    option?: FindOption<T>,
    token?: string,
  ): Promise<MicrogenResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const query = this._filter(option);
        const httpsAgent = await hA();
        const { data, status, statusText, headers } = await axios.get<T[]>(
          `${this.url}${query ? '?' + query : ''}`,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this.headers,
            httpsAgent,
          },
        );

        resolve({
          data,
          status,
          statusText,
          limit: Number(headers['x-pagination-limit']),
          skip: Number(headers['x-pagination-skip']),
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async getById(
    id: string,
    option?: GetByIdOption<T>,
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const query = this._filter(option);
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.get<T>(
          `${this.url}/${id}${query ? '?' + query : ''}`,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this.headers,
            httpsAgent,
          },
        );

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async create(
    body: Partial<T>,
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.post<T>(
          this.url,
          body,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this.headers,
            httpsAgent,
          },
        );

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async createMany(
    body: Partial<T>[],
    token?: string,
  ): Promise<MicrogenResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.post<T[]>(
          this.url,
          body,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this.headers,
            httpsAgent,
          },
        );

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async updateById(
    id: string,
    body: Partial<T>,
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.patch<T>(
          `${this.url}/${id}`,
          body,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this.headers,
            httpsAgent,
          },
        );

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async updateMany(
    body: Partial<T>[],
    token?: string,
  ): Promise<MicrogenResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.patch<T[]>(
          this.url,
          body,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this.headers,
            httpsAgent,
          },
        );

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async deleteById(
    id: string,
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.delete<T>(
          `${this.url}/${id}`,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this.headers,
            httpsAgent,
          },
        );

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async deleteMany(
    body: string[],
    token?: string,
  ): Promise<MicrogenResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.delete<T[]>(
          `${this.url}?recordIds=${body.join(',')}`,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this.headers,
            httpsAgent,
          },
        );

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async link(
    id: string,
    body: { [key: string]: string },
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.request<T>({
          method: 'LINK',
          url: `${this.url}/${id}`,
          headers: token ? { authorization: `Bearer ${token}` } : this.headers,
          httpsAgent,
          data: body,
        });

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async unlink(
    id: string,
    body: { [key: string]: string },
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve, _reject) => {
      try {
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.request<T>({
          method: 'UNLINK',
          url: `${this.url}/${id}`,
          headers: token ? { authorization: `Bearer ${token}` } : this.headers,
          httpsAgent,
          data: body,
        });

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  async count(
    option?: CountOption<T>,
    token?: string,
  ): Promise<MicrogenResponseCount> {
    return new Promise(async (resolve, _reject) => {
      try {
        const query = this._filter(option);
        const httpsAgent = await hA();
        const { data, status, statusText } = await axios.get<MicrogenCount>(
          `${this.url}/count${query ? '?' + query : ''}`,
          {
            headers: token
              ? { authorization: `Bearer ${token}` }
              : this.headers,
            httpsAgent,
          },
        );

        resolve({
          data,
          status,
          statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }
}
