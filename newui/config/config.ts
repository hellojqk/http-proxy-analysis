import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'HTTP请求对比',
  },
  exportStatic: {},
  base: "/ui/",
  publicPath: "/ui/",
  routes: [
    {
      path: '/index',
      name: '日志明细',
      icon: 'diff',
      component: './Index',
    },
    {
      path: '/api/index',
      name: '接口配置',
      icon: 'api',
      component: './api/Index',
    },
    {
      path: '/application/index',
      name: '应用配置',
      icon: 'appstore',
      component: './application/Index',
    },
    {
      path: '/',
      redirect: '/index',
    },
    {
      path: '/404',
      component: './404',
    },
  ],
  npmClient: 'npm',
});

