// components/UploadListComponent.js
import React from 'react';

const UploadListComponent = (props) => {
  const { record } = props;
  return <img src={record.imageUrl} alt={record.name} style={{ width: '50px', height: '50px' }} />;
};

export default UploadListComponent;
