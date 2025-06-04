import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// Define custom props by extending MUI's ButtonProps
interface PixelatedButtonProps extends Omit<ButtonProps, 'variant'> {
  // We can add custom props here if needed in the future
  // For example: pixelSize?: number;
}

const StyledButton = styled(Button)<PixelatedButtonProps>(({ theme, disabled }) => ({
  fontFamily: 'var(--font-press-start-2p), Courier, monospace', // Use CSS variable for Press Start 2P
  border: '2px solid black',       // Sharp, solid border
  borderRadius: 0,                 // No rounded corners
  padding: '8px 16px',
  textTransform: 'none',           // Keep text as is
  fontWeight: 'bold',
  color: disabled ? theme.palette.text.disabled : 'white',
  backgroundColor: disabled ? theme.palette.action.disabledBackground : theme.palette.primary.main,
  boxShadow: '2px 2px 0px black', // Simulates a bit of a 3D pixel effect
  transition: 'transform 0.1s ease-out, boxShadow 0.1s ease-out',
  imageRendering: 'pixelated', // Ensure any icons/images inside are pixelated

  '&:hover': {
    backgroundColor: disabled ? theme.palette.action.disabledBackground : theme.palette.primary.dark,
    boxShadow: disabled ? '2px 2px 0px black' : '3px 3px 0px black', // Slightly more pronounced shadow on hover
    transform: disabled ? 'none' : 'translate(-1px, -1px)',
  },

  '&:active': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: '1px 1px 0px black', // Inset shadow effect on click
    transform: 'translate(1px, 1px)',
  },

  // Styles for the disabled state are mostly handled by the 'disabled' prop check above
  // but MUI also applies its own disabled styles which we are leveraging.
}));

const PixelatedButton: React.FC<PixelatedButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  );
};

export default PixelatedButton;
