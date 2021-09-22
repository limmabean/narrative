import React from "react"
import {ArwesThemeProvider, Button, FrameBox, FramePentagon, StylesBaseline, Text} from "@arwes/core";
import { Grid, Row, Col } from 'react-flexbox-grid';
import TextGraphic from '../components/TextGraphic'
import script from "../script.json"
import "@fontsource/titillium-web";

const duration = { enter: 1000, exit: 1000 };

function changeWords(selectedText) {
  selectedText = "Changed this word"
}

// markup
const IndexPage = () => {
  let messages = [];
  function pushMessage(message) {
    messages.push(message);
  }

  return (
      <ArwesThemeProvider>
        <StylesBaseline styles={{body: { fontFamily: "Titillium Web" }}}/>
        <main>
          <title>Home Page</title>
          <Grid>
            <Row>
              <Col>
                <FrameBox>
                  <Text as={"h4"}>Origin: {script.messages[0].origin}</Text>
                  <br/>
                  <Text as={"h4"}>Destination: {script.messages[0].dest}</Text>
                  <br/>
                  <Text as={"span"}>Encryption: {script.messages[0].encryption}</Text>
                </FrameBox>
              </Col>
            </Row>
            <Row>
              <Col>
                <FrameBox>
                  <TextGraphic selectedText={script.messages[0]}></TextGraphic>
                </FrameBox>
              </Col>
            </Row>
            <Row>
              <Col>
                <FrameBox>
                  <TextGraphic selectedText={script.messages[0]}></TextGraphic>
                </FrameBox>
              </Col>
            </Row>
            <Row>
            </Row>
          </Grid>
        </main>
      </ArwesThemeProvider>
  )
}

export default IndexPage
