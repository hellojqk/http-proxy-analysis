import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, message, FormInstance, Popconfirm } from 'antd';
import React, { useState, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormCheckbox, ProFormRadio, ProFormText } from '@ant-design/pro-form';
import { list, remove, save } from './service';
import type { TableListItem, TableListPagination } from './data';

const mainMode = [
    {
        label: '源站',
        value: 'proxy',
    },
    {
        label: '镜像站',
        value: 'image',
    },
]
const TableList: React.FC = () => {
    const [createModalOpen, handleModalOpen] = useState<boolean>(false);
    const actionRef = useRef<ActionType>();
    const formRef = useRef<FormInstance>();

    const columns: ProColumns<TableListItem>[] = [
        { title: '序号', width: 100, dataIndex: 'ID', search: false, sorter: false, hideInForm: true, editable: false },
        { title: '名称', dataIndex: 'Name', search: false, sorter: false, },
        { title: '外部地址', dataIndex: 'Host', search: false, sorter: false, },
        { title: '代理服务地址', dataIndex: 'ProxyHost', search: false, sorter: false, },
        { title: '镜像服务地址', dataIndex: 'ImageHost', search: false, sorter: false, },
        {
            title: '主站', width: 100, dataIndex: 'Main', search: false, sorter: false, valueType: 'radioButton', valueEnum: mainMode.reduce((acc: Record<string, any>, cur) => { acc[cur.value] = { text: cur.label }; return acc }, {})
        },
        // { title: '状态', dataIndex: 'Status', valueType: "switch" },
        { title: '更新时间', dataIndex: 'UpdatedAt', search: false, sorter: false, valueType: 'dateTime' },
        {
            title: '操作', width: 100,
            dataIndex: 'option',
            valueType: 'option',
            render: (text, record: TableListItem, _, action) => [
                <a onClick={() => {
                    formRef.current?.setFieldsValue(record)
                    handleModalOpen(true)
                }}
                >编辑</a>
                ,
                <Popconfirm key="popconfirm" title={`确认删除${record.Name}吗?`} okText="是" cancelText="否" onConfirm={() => {
                    remove({ ID: record.ID }).then(() => {
                        actionRef.current?.reload()
                    }).catch((error) => {
                        message.error({ content: error.data?.errorMessage || "服务异常" })
                    })
                }}>
                    <a>删除</a>
                </Popconfirm>
            ],
        },
    ];

    return (
        <PageContainer header={{ title: null, breadcrumb: {} }}>
            <ProTable<TableListItem, TableListPagination>
                sticky
                actionRef={actionRef}
                headerTitle="应用管理"
                rowKey="id"
                toolBarRender={() => [
                    <Button icon={<PlusOutlined />} size='small' type="primary" key="primary" onClick={() => {
                        formRef.current?.resetFields();
                        handleModalOpen(true);
                    }}
                    >新建</Button>
                ]}
                request={list}
                columns={columns}
                pagination={false}
                search={false}
            />
            <ModalForm<TableListItem>
                title="新增数据"
                width="800px"
                formRef={formRef}
                open={createModalOpen}
                onOpenChange={handleModalOpen}
                modalProps={{ forceRender: true }}
                onFinish={async (value) => {
                    console.log("onFinish", value)
                    let finishRes = false;
                    await save(value).then(() => {
                        finishRes = true;
                        message.success({ content: "保存成功" })
                        actionRef.current?.reload()
                    }).catch(error => {
                        finishRes = false;
                        message.error({ content: error.data?.errorMessage || "服务异常" })
                    });
                    return finishRes;
                }}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                layout='horizontal'
            >
                <ProFormText hidden name="ID" />
                <ProFormText name="Name" required rules={[{ required: true }]} label="名称" placeholder="" />
                <ProFormText name="Host" required rules={[{ required: true }]} label="外部地址" placeholder="" />
                <ProFormText name="ProxyHost" required rules={[{ required: true }]} label="代理服务地址" placeholder="" />
                <ProFormText name="ImageHost" required rules={[{ required: true }]} label="镜像服务地址" placeholder="" />
                <ProFormRadio.Group name="Main" required rules={[{ required: true }]} label="代理模式" options={mainMode} placeholder="" />
            </ModalForm>
        </PageContainer >
    );
};

export default TableList;
