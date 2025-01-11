import React from 'react';

const ImageListComponent = (props) => {
  const { record } = props;
  return <img src={record.imageUrl} alt={record.name} style={{ width: '50px', height: '50px' }} />;
};

export default ImageListComponent;
