import dotenv from 'dotenv-flow'
import * as Path from 'path'

import { config } from '@keystone-6/core'

import { lists } from './src/keystone/schema'

dotenv.config()

export default config({
  db: {
    provider: 'mysql',
    url:
      process.env.DATABASE_URL ||
      'mysql://root:my-secret-pw@localhost:49949/onthehilldrama',
    additionalPrismaDatasourceProperties: {
      relationMode: 'prisma',
    },
  },
  ui: {
    isAccessAllowed: ({ session }) => session.allowAdminUI,
    basePath: '/admin',
  },
  lists,
})
