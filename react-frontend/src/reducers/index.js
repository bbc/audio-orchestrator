import { combineReducers } from 'redux';
import UIReducer from './UIReducer';
import ProjectReducer from './ProjectReducer';
import ExportReducer from './ExportReducer';

const rootReducer = combineReducers({
  UI: UIReducer,
  Project: ProjectReducer,
  Export: ExportReducer,
});

export default rootReducer;
