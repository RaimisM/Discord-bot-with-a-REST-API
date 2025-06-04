export default function createUsersManager() {
  return {
    getUser(username: string) {
      return { username }
    },
  }
}
