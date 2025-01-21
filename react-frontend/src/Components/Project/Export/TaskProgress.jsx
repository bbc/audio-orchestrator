import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Table,
  Icon,
  Header,
} from 'semantic-ui-react';

function TaskProgress({
  name,
  started,
  completed,
  total,
}) {
  const done = started && (completed === total);

  let icon = done ? 'checkmark' : 'wait';
  let loading = false;
  if (started && !done) {
    icon = 'spinner';
    loading = true;
  }

  const percent = total === 0 ? 100 : Math.round((completed / total) * 100, 0);

  return (
    <Table.Row positive={done}>
      <Table.Cell>
        <Icon name={icon} loading={loading} />
      </Table.Cell>
      <Table.Cell>
        <Header as="h4" content={name} />
        {started
          ? `${percent}%`
          : 'Not started.'}
      </Table.Cell>
      <Table.Cell />
    </Table.Row>
  );
}

TaskProgress.propTypes = {
  name: PropTypes.string.isRequired,
  started: PropTypes.bool.isRequired,
  completed: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

const mapStateToProps = ({ UI }, { taskIds }) => {
  const { tasks } = UI;
  const startedTasks = taskIds.filter((taskId) => taskId in tasks).map((taskId) => tasks[taskId]);

  return {
    started: (startedTasks.length > 0),
    ...startedTasks.reduce((acc, task) => ({
      completed: acc.completed + task.completed,
      total: acc.total + task.total,
    }), { completed: 0, total: 0 }),
  };
};

export default connect(mapStateToProps)(TaskProgress);
