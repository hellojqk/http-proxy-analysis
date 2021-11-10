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
    Host: string;
    ProxyHost: string;
    ImageHost: string;
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
    ProxyRequestMethod: string;
    ProxyRequestURL: string;
    ProxyRequestHeader: string;
    ProxyRequestBody: string;
    ProxyResponseHeader: string;
    ProxyResponseBody: string;
    ProxyResponseStatus: number;
    ProxyDuration: number;
    ImageResponseHeader: string;
    ImageResponseBody: string;
    ImageResponseStatus: number;
    ImageDuration: number;
    AnalysisStatus: string;
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