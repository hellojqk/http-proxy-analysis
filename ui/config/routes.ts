export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/index',
    name: 'index',
    icon: 'diff',
    component: './Index',
  },
  {
    path: '/api/index',
    name: 'api',
    icon: 'api',
    component: './api/Index',
  },
  {
    path: '/app/index',
    name: 'app',
    icon: 'appstore',
    component: './app/Index',
  },
  // {
  //   path: '/admin',
  //   name: 'admin',
  //   icon: 'crown',
  //   access: 'canAdmin',
  //   component: './Admin',
  //   routes: [
  //     {
  //       path: '/admin/sub-page',
  //       name: 'sub-page',
  //       icon: 'smile',
  //       component: './Index',
  //     },
  //   ],
  // },
  // {
  //   name: 'list.table-list',
  //   icon: 'table',
  //   path: '/list',
  //   component: './ListTableList',
  // },
  {
    path: '/',
    redirect: '/index',
  },
  {
    component: './404',
  },
];
