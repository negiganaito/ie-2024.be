import { passwordHash } from '@feathersjs/authentication-local'
import { resolve } from '@feathersjs/schema'
import { getValidator, ObjectIdSchema, querySyntax, Type } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const userSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    email: Type.String(),
    password: Type.Optional(Type.String()),
    firstName: Type.String(),
    lastName: Type.String(),
  },
  { $id: 'User', additionalProperties: false },
)
export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve({})

export const userExternalResolver = resolve({
  // The password should never be visible externally
  password: async () => undefined,
})

// Schema for creating new entries
export const userDataSchema = Type.Pick(
  userSchema,
  ['email', 'password', 'firstName', 'lastName'],
  {
    $id: 'UserData',
  },
)
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve({
  password: passwordHash({ strategy: 'local' }),
  createAt: async () => Date.now(),
})

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch',
})
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve({
  password: passwordHash({ strategy: 'local' }),
  firstName: async (value) => {
    return value
  },
  lastName: async (value) => {
    return value
  },
})

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['_id', 'email'])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve({
  // If there is a user (e.g. with authentication), they are only allowed to see their own data
  _id: async (value, user, context) => {
    if (context.params.user) {
      return context.params.user._id
    }

    return value
  },
})
