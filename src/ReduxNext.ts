import { Dispatch } from 'redux';
import ReduxNextTaskWrapper, {
  NextTask,
  ReduxNextContext,
} from './ReduxNextTaskWrapper';
import { ReduxNextActOption } from './redux-next-constants';


class ReduxNext<T extends ReduxNextContext = ReduxNextContext> {
  private runningTasks: {
    [actName: string]: ReduxNextTaskWrapper<any>[];
  } = {};

  public async waitAll() {
    const allPromises = [] as PromiseLike<any>[];
    Object.entries(this.runningTasks).forEach(([_, v]) => v.forEach((t) => {
      const p = t.getPromise();
      if (p) {
        allPromises.push(p);
      }
    }));
    await Promise.all(allPromises);
  }

  public runTask<T extends ReduxNextContext>(nextTask: NextTask<T>, actOption: ReduxNextActOption, dispatch: Dispatch,
    actName: string,
    data: object) {
    const ret = new Promise((r, j) => {
      setTimeout(() => {
        if (!this.runningTasks[actName]) {
          this.runningTasks[actName] = [];
        }
        if (actOption !== ReduxNextActOption.EVERY) {
          if (this.runningTasks[actName].length > 0) {
            if (actOption === ReduxNextActOption.LATEST) {
              this.runningTasks[actName].map((each) => each.cancel());
              this.runningTasks[actName] = [];
            } else if (actOption === ReduxNextActOption.LEADING) {
              return;
            }
          }
        }
        const task = new ReduxNextTaskWrapper(data, nextTask);
        this.runningTasks[actName].push(task);
        task.run(dispatch).then((d: any) => {
          r(d);
        }).finally(() => {
          this.runningTasks[actName] = this.runningTasks[actName].filter((v) => v !== task);
        }).catch((e: Error & {
          isCanceledError?: boolean;
        }) => {
          if (!e.isCanceledError) {
            j(e);
            // @ts-ignore
          } else if (ret?.onCancel) {
            // @ts-ignore
            ret?.onCancel();
          }
        });
      }, 2);
    }) as PromiseLike<any>;
    // @ts-ignore
    ret.cancel = (callback: () => Promise<void> | void) => {
      // @ts-ignore
      ret.onCancel = callback;
    };
    return ret as PromiseLike<any> & {
      cancel: (callback: () => Promise<void> | void) => void;
      onCancel: () => Promise<void> | void;
    };
  }
}

export default ReduxNext;
