import { CollectionConfig } from "payload";
import { z } from "zod";

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
  },
  auth: {
    tokenExpiration: 3600,
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000,
  },
  fields: [
    {
      name: 'id',
      type: 'text',
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: false,
    },
  ]
}

export const UserInput = z.object({
  id: z.string(),
  name: z.string(),
})

export type UserInput = z.input<typeof UserInput>
