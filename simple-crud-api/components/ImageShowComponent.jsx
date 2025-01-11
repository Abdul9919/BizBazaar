import React from 'react';

const ImageShowComponent = (props) => {
  const { record } = props;
  return <img src={record.imageUrl} alt={record.name} style={{ width: '200px', height: '200px' }} />;
};

export default ImageShowComponent;
