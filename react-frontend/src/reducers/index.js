import { combineReducers } from 'redux';
import UIReducer from './UIReducer';
import ProjectReducer from './ProjectReducer';

const rootReducer = combineReducers({
  UI: UIReducer,
  Project: ProjectReducer,
});

export default rootReducer;
