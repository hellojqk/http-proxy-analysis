declare namespace API {
  export interface CurrentUser {
    avatar?: string;
    name?: string;
    title?: string;
    group?: string;
    signature?: string;
    tags?: {
      key: string;
      label: string;
    }[];
    userid?: string;
    access?: 'user' | 'guest' | 'admin';
    unreadCount?: number;
  }

  export interface LoginStateType {
    status?: 'ok' | 'error';
    type?: string;
  }

  export interface NoticeIconData {
    id: string;
    key: string;
    avatar: string;
    title: string;
    datetime: string;
    type: string;
    read?: boolean;
    description: string;
    clickClose?: boolean;
    extra: any;
    status: string;
  }

}

export interface Model {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
}


export interface Application extends Model {
  Name: string;
  OldHost: string;
  NewHost: string;
  Status: boolean;
  APIs: API[];
}
export interface API extends Model {
  ApplicationID: number;
  URL: string;
  GET: boolean;
  GETSummary: string;
  POST: boolean;
  POSTSummary: string;
  PUT: boolean;
  PUTSummary: string;
  PATCH: boolean;
  PATCHSummary: string;
  DELETE: boolean;
  DELETESummary: string;
  Status: boolean;
  Application: Application;
}
export interface ProxyLog extends Model {
  ApplicationID: number;
  APIID: number;
  OldRequestMethod: string;
  OldRequestURL: string;
  OldRequestHeader: string;
  OldRequestBody: string;
  OldResponseHeader: string;
  OldResponseBody: string;
  OldResponseStatus: number;
  OldDuration: number;
  NewResponseHeader: string;
  NewResponseBody: string;
  NewResponseStatus: number;
  NewDuration: number;
  AnalysisResult: string;
  AnalysisDiffCount: number;
  Application: Application;
  API: API;
}

export interface DiffStrategy extends Model {
  Field: string;
  Code: string;
  APIID: number;
}