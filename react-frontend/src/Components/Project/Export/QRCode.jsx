import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode';

// this.qrcode = new QRCode(this.ref, {
//   text: url,
//   width: 128,
//   height: 128,
//   colorDark: '#000',
//   colorLight: '#fff',
//   correctLevel: QRCode.CorrectLevel.M,
// });

function QRCodeContainer({
  url,
}) {
  const [QRCodeUrl, setQRCodeUrl] = useState('');
  useEffect(() => {
    (async () => setQRCodeUrl(await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      width: 128,
    })))();
  }, [url, setQRCodeUrl]);

  if (!QRCodeUrl) {
    return null;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <img src={QRCodeUrl} alt="QR Code" width="128" height="128" />
    </div>
  );
}

QRCodeContainer.propTypes = {
  url: PropTypes.string.isRequired,
};

export default QRCodeContainer;
