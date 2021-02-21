import { Dispatch } from 'redux';
import CanceledError from './CanceledError';

export type ReduxNextContext = {
  stopIfCanceled(): void;
  dispatch: Dispatch;
}
export type NextTask<T extends ReduxNextContext = ReduxNextContext> =
  ((data: object, context: T) => Promise<any>)
  & ((context: T) => Promise<any>);


class ReduxNextTaskWrapper<T extends ReduxNextContext> {
  private promise: Promise<any> | null;
  private running = false;
  private canceled = false;
  private readonly data: object;
  private readonly handler: NextTask<T>;

  public constructor(data: object, handler: NextTask<T>) {
    this.handler = handler;
    this.data = data;
    this.promise = null;
  }

  public cancel() {
    this.canceled = true;
  }

  public run(dispatch: Dispatch) {
    this.promise = this.runInternal(dispatch).then((v) => {
      this.promise = null;
      return v;
    });
    return this.promise;
  }

  public getPromise() {
    return this.promise;
  }

  private async runInternal(dispatch: Dispatch) {
    this.running = true;
    await new Promise((r) => setImmediate(r));
    if (this.canceled) {
      throw new CanceledError();
    }
    try {
      if (this.handler.length === 1 && !this.data) {
        return this.handler({
          stopIfCanceled: () => {
            if (this.canceled) {
              throw new CanceledError();
            }
          },
          dispatch,
        } as T);
      }
      return this.handler(
        this.data,
        {
          stopIfCanceled: () => {
            if (this.canceled) {
              throw new CanceledError();
            }
          },
          dispatch,
        } as T,
      );
    } catch (e) {
      this.running = false;
      throw e;
    }
  }
}

export default ReduxNextTaskWrapper;
