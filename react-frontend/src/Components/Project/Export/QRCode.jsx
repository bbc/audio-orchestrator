import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcodejs/qrcode';

class QRCodeContainer extends React.PureComponent {
  componentDidMount() {
    this.generateQRCode();
  }

  generateQRCode() {
    const { url } = this.props;

    this.qrcode = new QRCode(this.ref, {
      text: url,
      width: 128,
      height: 128,
      colorDark: '#000',
      colorLight: '#fff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{ display: 'inline-block' }}
          ref={(r) => { this.ref = r; }}
        />
      </div>
    );
  }
}

QRCodeContainer.propTypes = {
  url: PropTypes.string.isRequired,
};

export default QRCodeContainer;
