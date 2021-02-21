import {
  StoreCreator,
  StoreEnhancer,
  StoreEnhancerStoreCreator,
} from 'redux';
import ReduxNext from './ReduxNext';


function createReduxNextEnhancer(): StoreEnhancer<{
  next: ReduxNext<any>;
}> {
  return (createStore: StoreCreator): StoreEnhancerStoreCreator<{
    next: ReduxNext<any>;
  }> => (
    reducer,
    preloadedState
  ) => {
    const store = createStore(reducer, preloadedState);
    return {
      ...store,
      next: new ReduxNext(),
    };
  };
}

export default createReduxNextEnhancer;
