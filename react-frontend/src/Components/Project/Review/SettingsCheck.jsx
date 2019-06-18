import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Header,
  Button,
} from 'semantic-ui-react';

const SettingsCheck = ({
  title,
  message,
  error,
  warning,
  onReview,
}) => {
  const valid = !warning && !error;
  const invalidIcon = error ? 'delete' : 'exclamation';
  return (
    <Table.Row positive={valid} negative={error} warning={warning}>
      <Table.Cell icon={valid ? 'checkmark' : invalidIcon} />
      <Table.Cell>
        <Header as="h4" content={title} />
        {valid ? 'Valid.' : (message || 'Invalid settings detected.')}
      </Table.Cell>
      <Table.Cell>
        {!valid && !!onReview
          ? <Button content="Review" icon="edit" labelPosition="left" onClick={onReview} />
          : null
        }
      </Table.Cell>
    </Table.Row>
  );
};

SettingsCheck.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  error: PropTypes.bool,
  warning: PropTypes.bool,
  onReview: PropTypes.func,
};

SettingsCheck.defaultProps = {
  message: null,
  error: false,
  warning: false,
  onReview: () => {},
};

export default SettingsCheck;
