import React from 'react';
import {
  Button,
  Segment,
  Card,
  Image,
  Popup,
  Dimmer,
} from 'semantic-ui-react';

const PlaceholderImageSegment = () => (
  <Segment placeholder attached>
    <Button icon="plus" content="Import image" primary labelPosition="left" />
  </Segment>
);

class RealImageSegment extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.onOpen = () => { this.setState({ open: true }); };
    this.onClose = () => { this.setState({ open: false }); };
  }

  render() {
    const { src } = this.props;
    const { open } = this.state;
    return (
      <Segment
        attached
        style={{ padding: 0 }}
        onMouseOver={this.onOpen}
        onFocus={this.onOpen}
        onMouseOut={this.onClose}
        onBlur={this.onClose}
        onClickOutside={this.onClose}
      >
        <Image fluid src={src} />
        <Dimmer active={open}>
          <Button icon="delete" negative content="Clear" labelPosition="left" />
        </Dimmer>
      </Segment>
    );
  }
}

const ImageCard = ({ src }) => {
  return (
    <Card>
      { src
        ? <RealImageSegment src={src} />
        : <PlaceholderImageSegment />
      }
      <Card.Content>
        <Card.Header content="Bar" />
        { src
          ? <Card.Meta content="foo.jpg (400 x 400)" />
          : <Card.Meta content="No image file added." />
        }
      </Card.Content>
      <Card.Content extra>
        <Popup trigger={<a>Used by 3 objects</a>} content="Foo, Bar, and 1 other" />
      </Card.Content>
    </Card>
  );
};

export default ImageCard;
