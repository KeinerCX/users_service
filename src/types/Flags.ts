export const Flags = [
  "user", 
  "admin", 
  "moderator",
  "developer"
]

export type Flag = typeof Flags[number];

// To be used when Service Tokens are implemented
/*export const Permissions = [
  "posts",
  "posts.create",
  "posts.edit",
  "posts.delete",
  "posts.read",
  "posts.events"
]

export type Permission = typeof Permissions[number];
*/