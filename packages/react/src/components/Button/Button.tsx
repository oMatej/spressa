import React from 'react';

import IButton from './IButton';
import { StyledButton } from './Button.styled';

const Button: React.FC<IButton> = props => <StyledButton {...props} />;

Button.defaultProps = {
  variant: 'primary',
};

export default Button;
