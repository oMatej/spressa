import styled from 'styled-components';

import IButton from './IButton';

export const StyledButton = styled.button<IButton>`
  padding: 8px 16px;
  background-color: darkgreen;
  color: azure;
  outline: none;
  border: none;
  border-radius: 3px;
  cursor: pointer;
`;
