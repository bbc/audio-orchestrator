import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
} from 'semantic-ui-react';
import BehaviourParameter from './BehaviourParameter';

const BehaviourParameters = React.memo(({
  parameters,
  values,
  onChange,
}) => (
  <Table definition>
    <Table.Body>
      {parameters.map(parameter => (
        <BehaviourParameter
          key={parameter.name}
          {...parameter}
          value={values[parameter.name]}
          onChange={(e, data) => onChange(e, {
            name: parameter.name,
            value: data.value,
          })}
        />
      ))}
    </Table.Body>
  </Table>
));

BehaviourParameters.propTypes = {
  parameters: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  values: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default BehaviourParameters;
