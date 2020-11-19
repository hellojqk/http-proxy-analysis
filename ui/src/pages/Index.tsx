import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Collapse, Divider, message, Tag, Typography, Table, Space } from 'antd';
import { queryProxyLog, retryProxyLog } from '@/services/proxyLog';
import ApplicationSelect from '@/components/ApplicationSelect';
import ApiSelect from '@/components/ApiSelect';
import { deleteDiffStrategy, insertDiffStrategy, queryDiffStrategyList } from '@/services/diffstrategy';

import { DiffStrategy, ProxyLog } from '@/services/API.d';

const { Panel } = Collapse;

const { Text } = Typography;

const methodMap = {
  "GET": "blue",
  "POST": "geekblue",
  "PUT": "purple",
  "PATCH": "magenta",
  "DELETE": "gold",
}

const AnalysisContent: React.FC<{ dataSource: any, APIID: number }> = ({ dataSource, APIID }) => {
  const [diffStrategyList, setDiffStrategyList] = useState<DiffStrategy[]>([])
  const loadDiffStrategy = () => {
    queryDiffStrategyList().then((result: DiffStrategy[]) => {
      setDiffStrategyList(result)
    })
  }
  useEffect(() => {
    if (!diffStrategyList || diffStrategyList.length === 0) {
      queryDiffStrategyList().then(result => {
        setDiffStrategyList(result)
      })
    }
  }, [])

  try {
    let data = []
    if (dataSource) {
      data = JSON.parse(dataSource)
    }
    return (<>
      <Space direction="vertical">
        <Text>已采用忽略规则</Text>
        {diffStrategyList.filter(f => f.APIID === 0 || f.APIID === APIID).map((item) => {
          return (<Space>
            <Space style={{ width: 300 }}>{item.Field}</Space>
            <Space style={{ width: 300 }}>{item.Code}</Space>
            <Space style={{ width: 300 }}>
              <a target="_blank" rel="noreferrer" onClick={async () => {
                try {
                  await deleteDiffStrategy(item.ID);
                  message.success('成功');
                  loadDiffStrategy()
                  return true;
                } catch (error) {
                  message.error('失败');
                  return false;
                }
              }}>禁用忽略</a>
            </Space>
          </Space>)
        })}
        <Text>本次对比差异项</Text>
        {data && data.map((item: DiffStrategy) => {
          if (diffStrategyList.filter(f => (f.APIID === APIID || f.APIID === 0) && item.Field.indexOf(f.Field) > -1 && f.Code === item.Code).length > 0) {
            return <></>
          }
          const fieldAry = item.Field.split(".")
          return (<Space>
            <Space style={{ width: 300 }}>{item.Field}</Space>
            <Space style={{ width: 300 }}>{item.Code}</Space>
            <Space style={{ width: 300 }}>
              <a onClick={async () => {
                try {
                  await insertDiffStrategy({ Field: `.${fieldAry[fieldAry.length - 1]}`, Code: item.Code, APIID });
                  message.success('成功');
                  loadDiffStrategy()
                  return true;
                } catch (error) {
                  message.error('失败');
                  return false;
                }
              }}>忽略【.{fieldAry[fieldAry.length - 1]}】部分差异</a>
            </Space>
          </Space>)
        })}
      </Space>
    </>)
  } catch (error) {
    return <p>{dataSource}</p>
  }
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
      order: 100,
      width: 200,
      render: (_, record) => {
        if (!record.Application) {
          return "-";
        }
        return <>{record.Application.Name}</>
      },
      renderFormItem: (item, config) => {
        return <ApplicationSelect {...config} />
      }
    },
    {
      title: '开始时间',
      width: 200,
      order: 95,
      dataIndex: 'CreatedAtStart',
      hideInTable: true,
      valueType: 'dateTime'
    },
    {
      title: '结束时间',
      width: 200,
      order: 94,
      dataIndex: 'CreatedAtEnd',
      hideInTable: true,
      valueType: 'dateTime'
    },
    {
      title: '路由',
      dataIndex: 'APIID',
      tooltip: '对应swagger文档上的固定url',
      order: 99,
      fixed: 'left',
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
      align: "center",
      dataIndex: 'OldRequestMethod',
      tooltip: '接口请求类型',
      valueEnum: {
        GET: { text: 'GET' },
        POST: { text: 'POST' },
        PUT: { text: 'PUT' },
        PATCH: { text: 'PATCH' },
        DELETE: { text: 'DELETE' },
      },
      render: (_, record) => {
        return <Tag color={methodMap[record.OldRequestMethod]}>{record.OldRequestMethod}</Tag>
      },
    },
    {
      title: '旧状态',
      width: 100,
      align: "center",
      dataIndex: 'OldResponseStatus',
      tooltip: '旧接口返回HTTP状态码',
      render: (_, record) => {
        if (record.OldResponseStatus !== 200) {
          return <Tag color="red">{record.OldResponseStatus}</Tag>
        }
        return <Tag color="green">{record.OldResponseStatus}</Tag>;
      },
    },
    {
      title: '新状态',
      width: 100,
      align: "center",
      dataIndex: 'NewResponseStatus',
      tooltip: '新接口返回HTTP状态码',
      render: (_, record) => {
        if (record.NewResponseStatus !== 200) {
          return <Tag color="red">{record.NewResponseStatus}</Tag>
        }
        return <Tag color="green">{record.NewResponseStatus}</Tag>;
      },
    },
    {
      title: '旧耗时',
      width: 100,
      search: false,
      align: "center",
      dataIndex: 'OldDuration',
      tooltip: '接口耗时，毫秒',
    },
    {
      title: '新耗时',
      width: 100,
      search: false,
      align: "center",
      dataIndex: 'NewDuration',
      tooltip: '接口耗时，毫秒',
    },
    {
      title: '分析结果',
      width: 120,
      search: false,
      align: "center",
      dataIndex: 'AnalysisDiffCount',
      tooltip: '后端服务初步分析的结果差异，详细差异见对比操作',
      render: (_, record) => {
        if (record.AnalysisDiffCount > 0) {
          return <Tag color="red">{record.AnalysisDiffCount}</Tag>
        }
        return <Tag color="green">{record.AnalysisDiffCount}</Tag>;
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
      tooltip: '接口请求路径',
      order: 98,
      copyable: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      render: (_, record: ProxyLog) => (
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
          // labelWidth: 80,
          span: 4,
          // defaultCollapsed: false,
        }}
        request={(params, sorter, filter) => queryProxyLog({ ...params, sorter, filter })}
        columns={columns}
        expandable={{
          rowExpandable: () => true,
          expandedRowRender: record => <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6', '7', '8']}>
            <Panel header="后端简要分析结果" key="1">
              <AnalysisContent dataSource={record.AnalysisResult} APIID={record.APIID} />
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
