export interface IServerResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}
