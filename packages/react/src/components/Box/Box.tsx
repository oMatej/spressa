import React from 'react';

import IBox from './IBox';
import { StyledBox } from './Box.styled';

const Box: React.FC<IBox> = props => <StyledBox {...props} />;

Box.defaultProps = {
  variant: 'primary',
};

export default Box;
