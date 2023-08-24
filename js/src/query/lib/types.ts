interface MicrogenResponseBase {
  status: number;
  statusText: string;
}

interface MicrogenError {
  message: string;
}

interface MicrogenResponseSuccess<T> extends MicrogenResponseBase {
  data?: T[];
  error?: null;
}

export interface MicrogenResponseFailure extends MicrogenResponseBase {
  data?: null;
  error?: MicrogenError;
}

interface Pagination {
  limit?: number | null;
  skip?: number | null;
}

export type MicrogenResponse<T> = (
  | MicrogenResponseSuccess<T>
  | MicrogenResponseFailure
) &
  Pagination;

interface MicrogenSingleResponseSuccess<T> extends MicrogenResponseBase {
  data?: T;
  error?: null;
}

export type MicrogenSingleResponse<T> =
  | MicrogenSingleResponseSuccess<T>
  | MicrogenResponseFailure;

type FieldLookup<T> = {
  [P in keyof Partial<T> | string]:
    | {
        ['$lookup']: Lookup<Record<string, unknown>>;
      }
    | '*';
};

export type Lookup<T> = {
  '*'?: Array<FieldLookup<T> | keyof T>;
  _id?: Array<FieldLookup<T> | keyof T | '*'>;
};

type Where<T> =
  | Partial<T>
  | {
      [P in keyof Partial<T> | string]:
        | {
            ['$in']?: (string | number | boolean)[];
          }
        | {
            ['$nin']?: (string | number | boolean)[];
          }
        | {
            ['$ne']?: string | number | boolean;
          }
        | {
            ['$contains']?: string | number | boolean;
          }
        | {
            ['$notContains']?: string | number | boolean;
          }
        | {
            ['$lt']?: number;
          }
        | {
            ['$lte']?: number;
          }
        | {
            ['$gt']?: number;
          }
        | {
            ['$gte']?: number;
          };
    };

export type FindOption<T> = {
  limit?: number;
  skip?: number;
  where?: Where<T>;
  sort?: { [P in keyof Partial<T>]: 1 | -1 }[];
  select?: Array<keyof Partial<T>>;
  lookup?: Array<keyof Partial<T>> | '*' | Lookup<T>;
  or?: Array<Where<T>>;
};

export type CountOption<T> = {
  where?: Where<T>;
  or?: Array<Where<T>>;
};

export type GetByIdOption<T> = {
  select?: Array<keyof Partial<T>>;
  lookup?: Array<keyof Partial<T>> | '*' | Lookup<T>;
};

export interface QueryClientOption {
  url: string;
  headers?: { [key: string]: string };
}

export interface MicrogenCount {
  count: number;
}

export interface MicrogenResponseSuccessCount extends MicrogenResponseBase {
  data?: MicrogenCount;
  error?: null;
}

export type MicrogenResponseCount =
  | MicrogenResponseSuccessCount
  | MicrogenResponseFailure;
