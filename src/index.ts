import ReduxNext from './ReduxNext';
import createReduxNextEnhancer from './createReduxNextEnhancer';
import { ReduxNextActOption } from './redux-next-constants';

import {
  ReduxNextContext,
  NextTask,
} from './ReduxNextTaskWrapper';

export type ActMapType = { [actName: string]: [NextTask<any>, ReduxNextActOption] | NextTask<any> };
export {
  createReduxNextEnhancer,
  ReduxNextContext,
  NextTask,
  ReduxNextActOption,
};

export default ReduxNext;
