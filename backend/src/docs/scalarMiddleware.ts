import { apiReference } from '@scalar/express-api-reference';
import { openApiSpec } from './swaggerSpec';

export const scalarDocsHandler = apiReference({
  spec: {
    content: openApiSpec
  },
  theme: 'deepSpace',
  pageTitle: 'ADAPTIVA-BOT API Reference & Interactive Docs',
  darkMode: true
});
