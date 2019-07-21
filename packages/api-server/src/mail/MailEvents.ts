import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'nest-emitter';

interface AppEvents {
  sendRegistrationMail: (email: string, username: string, token: string) => void;
  // as a side note: that is equivalent to
  // newRequest: Express.Request;
  newRequest: (req: Express.Request) => void;
}

export type MyEventEmitter = StrictEventEmitter<EventEmitter, AppEvents>;
