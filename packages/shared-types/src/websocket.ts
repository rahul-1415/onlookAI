export type ClientSocketEvent =
  | "session.join"
  | "video.progress"
  | "attention.event"
  | "intervention.answer";

export type ServerSocketEvent =
  | "session.started"
  | "attention.warning"
  | "video.pause"
  | "intervention.show"
  | "intervention.result"
  | "video.resume"
  | "session.complete";

export interface SocketEnvelope<TType extends string, TPayload> {
  type: TType;
  payload: TPayload;
}

