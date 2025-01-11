import React from 'react';
import { Box, H2, Text } from '@adminjs/design-system';

const DashboardComponent = ({ numberOfProducts, numberOfUsers }) => {
  return (
    <Box>
      <H2>Welcome to the Admin Dashboard</H2>
      <Text>Number of Products: {numberOfProducts}</Text>
      <Text>Number of Users: {numberOfUsers}</Text>
    </Box>
  );
};

export default DashboardComponent;