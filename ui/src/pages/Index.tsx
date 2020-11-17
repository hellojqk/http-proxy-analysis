import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Collapse, Divider, Input, message, Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import { queryProxyLog, retryProxyLog } from '../services/proxyLog';

import { queryApplication } from "../services/application"

const { Panel } = Collapse;

const { Option } = Select;

// import { Card, Alert, Typography } from 'antd';
// import styles from './Index.less';

// const CodePreview: React.FC<{}> = ({ children }) => (
//   <pre className={styles.pre}>
//     <code>
//       <Typography.Text copyable>{children}</Typography.Text>
//     </code>
//   </pre>
// );

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
  NewResponseHeader: string;
  NewResponseBody: string;
  NewResponseStatus: number;
  AnalysisResult: string;
  Application: Application;
  API: API;
}

const ApplicationSelect = (props: any) => {
  const [applicationList, setApplicationList] = useState<Application[]>([])
  useEffect(() => {
    if (!applicationList || applicationList.length == 0) {
      queryApplication().then(result => {
        if (result) {
          setApplicationList(result)
        }
      })
    }
  }, [])
  return <Select {...props} filterOption={(input, option: { label: string }) => {
    return option && option.label && option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  }} showSearch options={applicationList.map((f: Application) => { return { label: f.Name, value: f.ID } })} />
}

const ApiSelect = (props: any) => {
  const { form } = props
  const [applicationList, setApplicationList] = useState<Application[]>([])
  useEffect(() => {
    if (!applicationList || applicationList.length == 0) {
      queryApplication().then(result => {
        if (result) {
          setApplicationList(result)
        }
      })
    }
  }, [])
  const apiList: {}[] = [];
  const applicationID = form.getFieldValue("ApplicationID")
  if (applicationID && applicationList) {
    applicationList.forEach((app: Application) => {
      if (app.ID == applicationID && app.APIs) {
        app.APIs.forEach(api => {
          api.GET && apiList.push({ value: api.ID, label: `GET ${  api.URL  } ${  api.GETSummary}` })
          api.POST && apiList.push({ value: api.ID, label: `POST ${  api.URL  } ${  api.POSTSummary}` })
          api.PUT && apiList.push({ value: api.ID, label: `PUT ${  api.URL  } ${  api.PUTSummary}` })
          api.PATCH && apiList.push({ value: api.ID, label: `PATCH ${  api.URL  } ${  api.PATCHSummary}` })
          api.DELETE && apiList.push({ value: api.ID, label: `DELETE ${  api.URL  } ${  api.DELETESummary}` })
        })
      }
    })
  }
  return <Select {...props} filterOption={(input, option: { label: string }) => {
    return option && option.label && option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  }} showSearch options={apiList} />
}

export default (): React.ReactNode => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ProxyLog>[] = [
    {
      title: '编号',
      dataIndex: 'ID',
      search: false,
    },
    {
      title: '应用程序',
      dataIndex: 'ApplicationID',
      width: 200,
      render: (_, record) => {
        if (!record.Application) {
          return "-";
        }
        return <>{record.Application.Name}</>
      },
      renderFormItem: (item, config, form) => {
        return <ApplicationSelect {...config} />
      }
    },
    {
      title: '路由',
      dataIndex: 'APIID',
      render: (_, record) => {
        if (!record.API) {
          return "-";
        }
        return <>{record.API.URL}</>
      },
      renderFormItem: (item, config, form) => {
        return <ApiSelect {...config} form={form} />
      }
    },
    {
      title: '旧方法',
      width: 100,
      dataIndex: 'OldRequestMethod',
      tooltip: '接口请求类型',
      valueEnum: {
        GET: { text: 'GET' },
        POST: { text: 'POST' },
        PUT: { text: 'PUT' },
        PATCH: { text: 'PATCH' },
        DELETE: { text: 'DELETE' },
      }
    },

    {
      title: '旧状态',
      width: 100,
      dataIndex: 'OldResponseStatus',
      tooltip: '旧接口返回HTTP状态码'
    },
    {
      title: '新状态',
      width: 100,
      dataIndex: 'NewResponseStatus',
      tooltip: '新接口返回HTTP状态码'
    },
    {
      title: '分析结果',
      width: 120,
      dataIndex: 'AnalysisResult',
      search: false,
      tooltip: '后端服务初步分析的结果差异，详细差异见对比操作',
      render: (_, record) => {
        if (!record.AnalysisResult) {
          return <>0</>
        }
        try {
          const analysisResult = JSON.parse(record.AnalysisResult)
          return <>{analysisResult.length}</>
        } catch (error) {
          console.log("errorerrorerrorerrorerrorerror", record.AnalysisResult, error)
        }
        return <>0</>
      },
    },
    {
      title: '创建时间',
      width: 200,
      dataIndex: 'CreatedAt',
      search: false,
      valueType: 'dateTime'
    },
    {
      title: '旧Url',
      dataIndex: 'OldRequestURL',
      tooltip: '接口请求路径'
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <>
          <a target="_blank" rel="noreferrer" href={`/proxylog/${record.ID}`}>对比</a>
          <Divider type="vertical" />
          <a onClick={async () => {
            try {
              await retryProxyLog(record.ID);
              message.success('重发成功');
              return true;
            } catch (error) {
              message.error('重发失败');
              return false;
            }
          }}>重发</a>
        </>
      ),
    },
  ];

  return (
    <PageContainer pageHeaderRender={false}>
      <ProTable<ProxyLog>
        headerTitle="代理日志"
        scroll={{ x: 2500 }}
        actionRef={actionRef}
        rowKey="ID"
        search={{
          labelWidth: 120,
        }}
        request={(params, sorter, filter) => queryProxyLog({ ...params, sorter, filter })}
        columns={columns}
        expandable={{
          rowExpandable: () => true,
          expandedRowRender: record => <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6', '7', '8']}>
            <Panel header="后端简要分析结果" key="1">
              <p>{record.AnalysisResult}</p>
            </Panel>
            <Panel header="请求路径" key="2">
              <p>{record.Application ? record.Application.OldHost + record.OldRequestURL : record.OldRequestURL}</p>
            </Panel>
            <Panel header="请求头部信息" key="3">
              <p>{record.OldRequestHeader}</p>
            </Panel>
            <Panel header="请求发送内容" key="4">
              <p>{record.OldRequestBody}</p>
            </Panel>
            <Panel header={`旧应用返回头部信息，Status：${record.OldResponseStatus}`} key="5">
              <p>{record.OldResponseHeader}</p>
            </Panel>
            <Panel header="旧应用返回头部信息" key="6">
              <p>{record.OldResponseBody}</p>
            </Panel>
            <Panel header={`新应用返回头部信息，Status：${record.NewResponseStatus}`} key="7">
              <p>{record.NewResponseHeader}</p>
            </Panel>
            <Panel header="新应用返回头部信息" key="8">
              <p>{record.NewResponseBody}</p>
            </Panel>
          </Collapse>,
        }}
      />
    </PageContainer>
  )
}
