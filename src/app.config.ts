export default defineAppConfig({
  pages: [
    'pages/schedule/index',
    'pages/occupancy/index',
    'pages/batch/index',
    'pages/recall/index',
    'pages/schedule-detail/index',
    'pages/schedule-create/index',
    'pages/batch-detail/index',
    'pages/batch-create/index',
    'pages/recall-detail/index',
    'pages/station/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#E53935',
    navigationBarTitleText: '血站采血排班系统',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#E53935',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/schedule/index',
        text: '采血排期'
      },
      {
        pagePath: 'pages/occupancy/index',
        text: '占用管理'
      },
      {
        pagePath: 'pages/batch/index',
        text: '批次管理'
      },
      {
        pagePath: 'pages/recall/index',
        text: '流向召回'
      }
    ]
  }
})
