import { combineReducers } from 'redux';
import UIReducer from './UIReducer';

const rootReducer = combineReducers({
  UI: UIReducer,
});

export default rootReducer;
