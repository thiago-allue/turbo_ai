import React from "react";
import styled from "styled-components";

const StyledButton = styled.button`
  display: inline-block;
  padding: 0.5em 1em;
  margin-right: 65px;
  font-size: 1rem;
  border: 2px solid #9A773F;
  border-radius: 30px;
  background-color: #fff;
  color: #9A773F;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #EFE7D5;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(154, 119, 63, 0.4);
  }
`;

const NewNoteButton = ({ onClick }) => {
  return (
    <StyledButton onClick={onClick}>
      + New Note
    </StyledButton>
  );
};

export default NewNoteButton;
