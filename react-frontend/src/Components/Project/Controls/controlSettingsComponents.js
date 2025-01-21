/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/

import CheckboxControlSettings from './CheckboxControlSettings.jsx';
import CounterControlSettings from './CounterControlSettings.jsx';
import RangeControlSettings from './RangeControlSettings.jsx';

export default {
  checkbox: CheckboxControlSettings,
  radio: CheckboxControlSettings, // The difference is controlled through the controlType prop
  counter: CounterControlSettings,
  range: RangeControlSettings,
};
