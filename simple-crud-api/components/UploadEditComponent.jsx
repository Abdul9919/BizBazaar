import React from 'react';
import { Box, Label, DropZone, DropZoneItem } from '@adminjs/design-system';

const UploadEditComponent = (props) => {
  const { property, onChange, record } = props;

  const uploadedFile = record.params[property.name];

  return (
    <Box>
      <Label>{property.label}</Label>
      <DropZone onChange={(files) => onChange(property.name, files[0])} />
      {uploadedFile && <DropZoneItem src={uploadedFile} />}
    </Box>
  );
};

export default UploadEditComponent;