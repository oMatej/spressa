import React from 'react';
import { sum } from '@spressa/core';

// Delete me
export const Thing: React.FC<{ test: string }> = ({ test }) => {
  return (
    <div>
      Snozzberries taste like snozzberries {test} {sum(3, 4)}
    </div>
  );
};
