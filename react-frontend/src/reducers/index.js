import { combineReducers } from 'redux';
import UIReducer from './UIReducer';
import ProjectReducer from './ProjectReducer';
import ExportReducer from './ExportReducer';
import MonitoringReducer from './MonitoringReducer';

const rootReducer = combineReducers({
  UI: UIReducer,
  Project: ProjectReducer,
  Export: ExportReducer,
  Monitoring: MonitoringReducer,
});

export default rootReducer;
