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

type LookupRecord =
  | '*'
  | string
  | string[]
  | Record<
      '*' | '_id',
      | '*'
      | string
      | (
          | string
          | Record<
              string,
              | {
                  $select?: string[];
                  $lookup?: LookupRecord;
                }
              | undefined
            >
        )
      | undefined
    >;

export type QueryLookup<T> = Record<
  '*' | '_id',
  | '*'
  | keyof T
  | (
      | keyof T
      | Record<
          keyof T,
          | {
              $select?: string[];
              $lookup?: LookupRecord;
            }
          | undefined
        >
    )[]
  | undefined
>;

type Where<T> = Record<
  keyof T,
  | string
  | number
  | boolean
  | {
      ['$in']?: (string | number | boolean)[];
      ['$nin']?: (string | number | boolean)[];
      ['$ne']?: string | number | boolean;
      ['$contains']?: string | number | boolean;
      ['$notContains']?: string | number | boolean;
      ['$lt']?: number;
      ['$lte']?: number;
      ['$gt']?: number;
      ['$gte']?: number;
      ['isEmpty']?: boolean;
      ['isNotEmpty']?: boolean;
    }
  | undefined
>;

export interface FindOption<T> {
  limit?: number;
  skip?: number;
  where?: Where<T>;
  sort?: Record<keyof T, 1 | -1 | undefined>[];
  select?: (keyof T)[];
  lookup?: keyof T | (keyof T)[] | '*' | QueryLookup<T>;
  or?: Where<T>[];
}

export interface CountOption<T> {
  where?: Where<T>;
  or?: Where<T>[];
}

export interface GetByIdOption<T> {
  select?: (keyof T)[];
  lookup?: keyof T | (keyof T)[] | '*' | QueryLookup<T>;
}

export interface QueryClientOption {
  url: string;
  headers?: Record<string, string>;
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
