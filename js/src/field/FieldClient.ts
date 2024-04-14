import {
  Field,
  FieldClientOption,
  FieldResponse,
  FieldResponseFailure,
  FieldSingleResponse,
} from './lib/types';
import httpsAgent from './lib/httpsAgent';

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

export default class FieldClient<T> {
  protected url: string;
  protected headers: { [key: string]: string };

  constructor(url: string, options: FieldClientOption) {
    this.url = `${url}/fields`;
    this.headers = { ...options.headers };
  }

  private _error(error: any): FieldResponseFailure {
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

  find(): Promise<FieldResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const dispatcher = await httpsAgent();
        const res = await this._checkResponse(
          await fetch(this.url, {
            headers: this.headers,
            // @ts-expect-error
            dispatcher,
          }),
        );
        const data = (await res.json()) as Field<T>[];

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

  getById(id: string): Promise<FieldSingleResponse<T>> {
    return new Promise(async (resolve) => {
      try {
        const dispatcher = await httpsAgent();
        const res = await this._checkResponse(
          await fetch(`${this.url}/${id}`, {
            headers: this.headers,
            // @ts-expect-error
            dispatcher,
          }),
        );
        const data = (await res.json()) as Field<T>;

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
