// shared/types/api.ts

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> =
  | { success : true; data: T , message : string }
  | { success : false; error: ApiError , message : string };