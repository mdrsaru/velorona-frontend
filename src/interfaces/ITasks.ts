export interface ITasks {
  ids: Array<string>,
  name: string
}

export interface ITaskUsers {
  avatar: {
    url: string
  },
  fullName: string,
  id: string,
}