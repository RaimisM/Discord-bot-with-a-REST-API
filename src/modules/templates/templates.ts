// src/modules/templates/templates.ts

import type { Database } from '@/database'

export function createTemplateManager(db: Database) {
  return {
    getTemplates: async (req, res, next) => {
      // your logic here
    },
    postTemplates: async (req, res, next) => {
      // your logic here
    },
    patchTemplates: async (req, res, next) => {
      // your logic here
    },
    deleteTemplates: async (req, res, next) => {
      // your logic here
    },
  }
}
