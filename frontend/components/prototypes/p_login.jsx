import React from "react";
import { IconNameNotVisibleStyleFalseSize16Px } from "./IconNameNotVisibleStyleFalseSize16Px";
import group11 from "./group-1-1.png"; // Still need this import for the image

// Define style objects matching your original CSS:
const macbookAirStyles = {
  backgroundColor: "#faf1e3",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  width: "100%",
};

const innerDivStyles = {
  backgroundColor: "#faf1e3",
  height: "832px",
  position: "relative",
  width: "1280px",
};

const categoryDropdownStyles = {
  alignItems: "flex-start",
  display: "flex",
  flexDirection: "column",
  gap: "7px",
  left: "448px",
  position: "absolute",
  top: "434px",
  width: "384px",
};

const randomThoughtsWrapperStyles = {
  alignItems: "center",
  alignSelf: "stretch",
  border: "1px solid #947038",
  borderRadius: "6px",
  display: "flex",
  gap: "8px",
  height: "39px",
  padding: "7px 15px",
  position: "relative",
  width: "100%",
};

const randomThoughtsStyles = {
  color: "#000000",
  flex: 1,
  fontFamily: "Inter-Regular, Helvetica",
  fontSize: "12px",
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: "normal",
  position: "relative",
};

const overlapGroupStyles = {
  height: "39px",
  left: "448px",
  position: "absolute",
  top: "486px",
  width: "384px",
};

const categoryDropdownWrapperStyles = {
  alignItems: "flex-start",
  display: "flex",
  flexDirection: "column",
  gap: "7px",
  left: 0,
  position: "absolute",
  top: 0,
  width: "384px",
};

const iconographyStyles = {
  height: "16px",
  width: "16px",
  position: "absolute",
  left: "358px",
  top: "12px",
};

const yayYoureBackStyles = {
  color: "#88632a",
  fontFamily: "Inria Serif-Bold, Helvetica",
  fontSize: "48px",
  fontWeight: 700,
  letterSpacing: 0,
  lineHeight: "normal",
  position: "absolute",
  left: "456px",
  top: "340px",
};

const buttonStyles = {
  all: "unset",
  alignItems: "center",
  border: "1px solid #947038",
  borderRadius: "46px",
  boxSizing: "border-box",
  display: "flex",
  gap: "6px",
  height: "43px",
  justifyContent: "center",
  left: "448px",
  padding: "12px 16px",
  position: "absolute",
  top: "568px",
  width: "384px",
  cursor: "pointer",
};

const newNoteStyles = {
  color: "#947038",
  fontFamily: "Inter-Bold, Helvetica",
  fontSize: "16px",
  fontWeight: 700,
  letterSpacing: 0,
  lineHeight: "normal",
  marginTop: "-1px",
  position: "relative",
  whiteSpace: "nowrap",
  width: "fit-content",
};

const textWrapperStyles = {
  color: "#947038",
  fontFamily: "Inter-Regular, Helvetica",
  fontSize: "12px",
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: "normal",
  position: "absolute",
  left: "544px",
  top: "623px",
  textDecoration: "underline",
};

const groupStyles = {
  height: "114px",
  objectFit: "cover",
  position: "absolute",
  left: "580px",
  top: "194px",
  width: "95px",
};

export const MacbookAir = () => {
  return (
    <div style={macbookAirStyles}>
      <div style={innerDivStyles}>
        <div style={categoryDropdownStyles}>
          <div style={randomThoughtsWrapperStyles}>
            <div style={randomThoughtsStyles}>Email address</div>
          </div>
        </div>

        <div style={overlapGroupStyles}>
          <div style={categoryDropdownWrapperStyles}>
            <div style={randomThoughtsWrapperStyles}>
              <div style={randomThoughtsStyles}>Password</div>
            </div>
          </div>
          <IconNameNotVisibleStyleFalseSize16Px
            style={iconographyStyles}
            color="#957139"
          />
        </div>

        <div style={yayYoureBackStyles}>Yay, You&#39;re Back!</div>

        <button style={buttonStyles}>
          <div style={newNoteStyles}>Login</div>
        </button>

        <p style={textWrapperStyles}>Oops! I’ve never been here before</p>

        <img style={groupStyles} alt="Group" src={group11} />
      </div>
    </div>
  );
};
