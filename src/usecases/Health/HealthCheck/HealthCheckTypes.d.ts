export type IStatus = "OK" | "ERROR";
export type IHealthCheckStatus = "UP" | "DOWN";

export interface IServiceResponseObject {
  status: IHealthCheckStatus;
  lastCheckedAt: string;
}

export interface IHealthCheckUseCaseResponse {
  status: IStatus;
  message: string;
  currentTime: string;
}
