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
import getDispatcher from '../lib/dispatcher';

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

  find(option?: FindOption<T>, token?: string): Promise<MicrogenResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const query = this._filter(option);
        const res = await this._checkResponse(
          await fetch(`${this.url}${query ? '?' + query : ''}`, {
            headers: token
              ? { ...this.headers, Authorization: `Bearer ${token}` }
              : this.headers,
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T[];

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
          limit: Number(res.headers.get('x-pagination-limit')),
          skip: Number(res.headers.get('x-pagination-skip')),
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  getById(
    id: string,
    option?: GetByIdOption<T>,
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const query = this._filter(option);
        const res = await this._checkResponse(
          await fetch(`${this.url}/${id}${query ? '?' + query : ''}`, {
            headers: token
              ? { ...this.headers, Authorization: `Bearer ${token}` }
              : this.headers,
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T;

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  create(body: Partial<T>, token?: string): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(this.url, {
            method: 'POST',
            headers: token
              ? {
                  ...this.headers,
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              : { ...this.headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T;

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  createMany(body: Partial<T>[], token?: string): Promise<MicrogenResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(this.url, {
            method: 'POST',
            headers: token
              ? {
                  ...this.headers,
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              : { ...this.headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T[];

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  updateById(
    id: string,
    body: Partial<T>,
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(`${this.url}/${id}`, {
            method: 'PATCH',
            headers: token
              ? {
                  ...this.headers,
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              : { ...this.headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T;

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  updateMany(body: Partial<T>[], token?: string): Promise<MicrogenResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(this.url, {
            method: 'PATCH',
            headers: token
              ? {
                  ...this.headers,
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              : { ...this.headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T[];

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  deleteById(id: string, token?: string): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(`${this.url}/${id}`, {
            method: 'DELETE',
            headers: token
              ? { ...this.headers, Authorization: `Bearer ${token}` }
              : this.headers,
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T;

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  deleteMany(body: string[], token?: string): Promise<MicrogenResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(`${this.url}?recordIds=${body.join(',')}`, {
            method: 'DELETE',
            headers: token
              ? { ...this.headers, Authorization: `Bearer ${token}` }
              : this.headers,
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T[];

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  link(
    id: string,
    body: { [key: string]: string },
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(`${this.url}/${id}`, {
            method: 'LINK',
            headers: token
              ? {
                  ...this.headers,
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              : { ...this.headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T;

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  unlink(
    id: string,
    body: { [key: string]: string },
    token?: string,
  ): Promise<MicrogenSingleResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const res = await this._checkResponse(
          await fetch(`${this.url}/${id}`, {
            method: 'UNLINK',
            headers: token
              ? {
                  ...this.headers,
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              : { ...this.headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as T;

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }

  count(
    option?: CountOption<T>,
    token?: string,
  ): Promise<MicrogenResponseCount> {
    return new Promise(async (resolve) => {
      try {
        const query = this._filter(option);
        const res = await this._checkResponse(
          await fetch(`${this.url}/count${query ? '?' + query : ''}`, {
            headers: token
              ? { ...this.headers, Authorization: `Bearer ${token}` }
              : this.headers,
            // @ts-expect-error
            dispatcher: await getDispatcher(),
          }),
        );
        const data = (await res.json()) as MicrogenCount;

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        resolve(this._error(error));
      }
    });
  }
}
