import React from 'react';
import { connect } from 'react-redux';

import {
  Table,
  Icon,
  Header,
} from 'semantic-ui-react';

const TaskProgress = ({
  name,
  started,
  completed,
  total,
}) => {
  const done = started && (completed === total);

  let icon = done ? 'checkmark' : 'wait';
  let loading = false;
  if (started && !done) {
    icon = 'spinner';
    loading = true;
  }

  return (
    <Table.Row positive={done}>
      <Table.Cell>
        <Icon name={icon} loading={loading} />
      </Table.Cell>
      <Table.Cell>
        <Header as="h4" content={name} />
        {started
          ? `${Math.round(completed / total * 100, 0)}% (${completed} of ${total})`
          : 'Not started.'
        }
      </Table.Cell>
      <Table.Cell />
    </Table.Row>
  );
};

const mapStateToProps = ({ UI }, { taskIds }) => {
  const { tasks } = UI;
  return {
    started: (taskIds.length > 0),
    ...taskIds.reduce((acc, taskId) => ({
      completed: acc.completed + tasks[taskId].completed,
      total: acc.total + tasks[taskId].total,
    }), { completed: 0, total: 0 }),
  };
};

export default connect(mapStateToProps)(TaskProgress);
