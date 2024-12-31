import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Collapse, Divider, message, Tag, Typography, Table, Space, Button } from 'antd';
import { ignoreProxyLog, queryProxyLog, retryProxyLog, saveProxyLog } from '@/services/proxyLog';
import ApplicationSelect from '@/components/ApplicationSelect';
import ApiSelect from '@/components/ApiSelect';
import { deleteDiffStrategy, insertDiffStrategy, queryDiffStrategyList } from '@/services/diffstrategy';

import { DiffStrategy, ProxyLog } from '@/services/data';
import { toLower } from 'lodash';

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
                        <Space style={{ width: 500 }}>{item.Field}</Space>
                        <Space style={{ width: 200 }}>{item.Code}</Space>
                        <Space>
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
                        <Space style={{ width: 500 }}>{item.Field}</Space>
                        <Space style={{ width: 200 }}>{item.Code}</Space>
                        <Space>
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
                            }}>忽略【.{fieldAry[fieldAry.length - 1]}】差异</a>
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
            width: 100,
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
            dataIndex: 'CreatedAtBegin',
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
            title: '代理方法',
            width: 100,
            align: "center",
            dataIndex: 'ProxyRequestMethod',
            tooltip: '接口请求类型',
            valueEnum: {
                GET: { text: 'GET' },
                POST: { text: 'POST' },
                PUT: { text: 'PUT' },
                PATCH: { text: 'PATCH' },
                DELETE: { text: 'DELETE' },
            },
            render: (_, record) => {
                return <Tag color={methodMap[record.ProxyRequestMethod]}>{record.ProxyRequestMethod}</Tag>
            },
        },
        {
            title: '代理状态',
            width: 100,
            align: "center",
            dataIndex: 'ProxyResponseStatus',
            tooltip: '代理接口返回HTTP状态码',
            render: (_, record) => {
                if (record.ProxyResponseStatus !== 200) {
                    return <Tag color="red">{record.ProxyResponseStatus}</Tag>
                }
                return <Tag color="green">{record.ProxyResponseStatus}</Tag>;
            },
        },
        {
            title: '镜像状态',
            width: 100,
            align: "center",
            dataIndex: 'ImageResponseStatus',
            tooltip: '镜像接口返回HTTP状态码',
            render: (_, record) => {
                if (record.ImageResponseStatus !== 200) {
                    return <Tag color="red">{record.ImageResponseStatus}</Tag>
                }
                return <Tag color="green">{record.ImageResponseStatus}</Tag>;
            },
        },
        {
            title: '代理耗时',
            width: 100,
            search: false,
            align: "center",
            dataIndex: 'ProxyDuration',
            tooltip: '接口耗时，毫秒',
        },
        {
            title: '镜像耗时',
            width: 100,
            search: false,
            align: "center",
            dataIndex: 'ImageDuration',
            tooltip: '接口耗时，毫秒',
        },
        {
            title: '分析结果',
            width: 120,
            search: true,
            align: "center",
            dataIndex: 'AnalysisDiffCount',
            valueEnum: { "-1": "无差异", "0": "全部", "1": "有差异" },
            tooltip: '后端服务初步分析的结果差异，详细差异见对比操作',
            render: (_, record) => {
                if (record.AnalysisStatus === "N" || !record.ImageResponseBody) {
                    return <>-</>
                }
                if (record.AnalysisDiffCount > 0) {
                    return <div><Tag color="red">{record.AnalysisDiffCount}</Tag><a style={{ color: "red" }} onClick={() => {
                        ignoreProxyLog({ ID: record.ID }).then(() => {
                            message.success({ content: "已忽略" })
                            actionRef.current?.reload()
                        }).catch(error => {
                            message.error({ content: error.data?.errorMessage || "服务异常" })
                        });
                    }}>忽略</a></div>
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
            title: '代理Url',
            dataIndex: 'ProxyRequestURL',
            tooltip: '接口请求路径',
            order: 98,
            copyable: true,
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            fixed: 'right',
            width: 150,
            render: (_, record: ProxyLog) => {
                let copyTextLocal = ``
                let copyText = `curl -v -X ${record.ProxyRequestMethod}`;

                const header = JSON.parse(record.ProxyRequestHeader)
                Object.keys(header).forEach(key => {
                    const lowerKey = toLower(key)
                    if (lowerKey == "content-length" || lowerKey == "accept-encoding") {
                        return;
                    }
                    copyText += ` -H "${key}:${header[key][0]}"`
                })

                switch (record.ProxyRequestMethod) {
                    case "GET":
                        break;
                    default:
                        if (record.ProxyRequestBody) {
                            copyText += ` -d '${record.ProxyRequestBody}'`
                        }
                        break;
                }
                copyTextLocal = `${copyText} http://localhost:8080${record.ProxyRequestURL.replaceAll('&', '\\&')}`

                copyText += ` ${record.Application ? record.Application.Host : ""}${record.ProxyRequestURL.replaceAll('&', '\\&')}`
                return <>
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
                    <Divider type="vertical" />
                    <Text copyable={{ text: copyText, tooltips: ['原始curl'] }} />
                    <Text copyable={{ text: copyTextLocal, tooltips: ['本地curl'] }} />
                </>
            },
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
                    span: 6,
                    defaultCollapsed: false,
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
                            <p>{record.Application ? record.Application.Host + record.ProxyRequestURL : record.ProxyRequestURL}</p>
                            <p>{record.Application ? record.Application.ProxyHost + record.ProxyRequestURL : record.ProxyRequestURL}</p>
                            <p>{record.Application ? record.Application.ImageHost + record.ProxyRequestURL : record.ProxyRequestURL}</p>
                        </Panel>
                        <Panel header="请求头部信息" key="3">
                            <p>{record.ProxyRequestHeader}</p>
                        </Panel>
                        <Panel header="请求发送内容" key="4">
                            <p>{record.ProxyRequestBody}</p>
                        </Panel>
                        <Panel header={`代理返回Header，Status：${record.ProxyResponseStatus}`} key="5">
                            <p>{record.ProxyResponseHeader}</p>
                        </Panel>
                        <Panel header="代理返回Body" key="6">
                            <p>{record.ProxyResponseBody}</p>
                        </Panel>
                        <Panel header={`镜像返回Header，Status：${record.ImageResponseStatus}`} key="7">
                            <p>{record.ImageResponseHeader}</p>
                        </Panel>
                        <Panel header="镜像返回Body" key="8">
                            <p>{record.ImageResponseBody}</p>
                        </Panel>
                    </Collapse>,
                }}
            />
        </PageContainer>
    )
}
