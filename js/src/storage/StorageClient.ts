import {
  StorageResponseFailure,
  StorageSingleResponse,
  Storage,
} from './lib/types';
import { AuthClient } from '../auth';
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

export default class StorageClient {
  protected url: string;
  protected auth: AuthClient;

  constructor(url: string, auth: AuthClient) {
    this.url = url;
    this.auth = auth;
  }

  private _error(error: any): StorageResponseFailure {
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

  private _getHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {};
    const authBearer = this.auth.token();
    if (authBearer && authBearer !== '') {
      headers['Authorization'] = `Bearer ${authBearer}`;
    }
    return headers;
  }

  upload(
    file: Blob | File,
    fileName?: string,
    token?: string,
  ): Promise<StorageSingleResponse> {
    return new Promise(async (resolve) => {
      try {
        const form = new FormData();

        if (!fileName && file.constructor.name === 'Blob') {
          throw new FailedHTTPResponse(
            400,
            'Bad Request',
            'fileName is required',
          );
        }

        form.set(
          'file',
          file,
          !fileName && file.constructor.name === 'File'
            ? (file as File).name
            : fileName,
        );

        const dispatcher = await httpsAgent();
        const res = await this._checkResponse(
          await fetch(`${this.url}/upload`, {
            method: 'POST',
            headers: token
              ? { ...this._getHeaders(), Authorization: `Bearer ${token}` }
              : this._getHeaders(),
            body: form,
            // @ts-expect-error
            dispatcher,
          }),
        );
        const data = (await res.json()) as Storage;

        resolve({
          data,
          status: res.status,
          statusText: res.statusText,
        });
      } catch (error) {
        return resolve(this._error(error));
      }
    });
  }
}
