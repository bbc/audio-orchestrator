import CheckboxControlSettings from './CheckboxControlSettings';
import CounterControlSettings from './CounterControlSettings';
import RangeControlSettings from './RangeControlSettings';

export default {
  checkbox: CheckboxControlSettings,
  radio: CheckboxControlSettings, // The difference is controlled through the controlType prop
  counter: CounterControlSettings,
  range: RangeControlSettings,
};
