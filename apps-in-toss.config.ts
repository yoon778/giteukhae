import { defineConfig } from '@apps-in-toss/web-framework/config'

export default defineConfig({
  // 콘솔 등록 후 실제 appName과 반드시 일치시킬 것
  appName: 'giteukhae',
  brand: {
    primaryColor: '#C44948',
  },
  permissions: [],
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
    withTitle: true,
  },
  webBundleDir: 'dist',
})
