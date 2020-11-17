import { PageContainer } from "@ant-design/pro-layout"
import React from "react"
import { Card } from 'antd';

export default (): React.ReactNode => {
  return (
    <PageContainer pageHeaderRender={false}>
      <Card title="功能预告" style={{ width: 300 }}>
        <p>支持应用维护</p>
        <p>支持k8s一键部署代理端</p>
      </Card>
    </PageContainer>
  )
}