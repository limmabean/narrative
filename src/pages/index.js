import React from "react"
import {ArwesThemeProvider, Button, FrameBox, FramePentagon, StylesBaseline, Text} from "@arwes/core";
import { Grid, Row, Col } from 'react-flexbox-grid';
import TextGraphic from '../components/TextGraphic'
import script from "../script.json"

const duration = { enter: 1000, exit: 1000 };

function changeWords(selectedText) {
  selectedText = "Changed this word"
}
// markup
const IndexPage = () => {
  return (
      <ArwesThemeProvider>
        <StylesBaseline/>
        <main>
          <title>Home Page</title>
          <Grid>
            <Row>
              <Col>
                <TextGraphic selectedText={script.messages[0]}></TextGraphic>
              </Col>
              <Col>
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
