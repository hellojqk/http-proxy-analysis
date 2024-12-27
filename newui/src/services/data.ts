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
    Main: string;
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