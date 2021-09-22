import React, { useState } from "react"
import {ArwesThemeProvider, Button, FrameBox, FrameLines, StylesBaseline, List, FrameHexagon, Text} from "@arwes/core";
import Sketch from "react-p5";

import { Grid, Row, Col } from 'react-flexbox-grid';
import TextGraphic from '../components/TextGraphic'
import script from "../script.json"
import "@fontsource/titillium-web";

const duration = { enter: 1000, exit: 1000 };
let x = 50;
let y = 50;
let angle = 0;
let panicLevel = 10;
let panicLevelCurrent = 0;
// markup
const IndexPage = () => {
  const panicSetup = (p5, canvasParentRef) => {
    // use parent to render the canvas in this ref
    // (without that p5 will render the canvas outside of your component)
    p5.createCanvas(120, 120, p5.WEBGL).parent(canvasParentRef);
  };

  const panicUp = () => {
    if (panicLevel < 10) panicLevel++;
  }
  const panicDown = () => {
    if (panicLevel > 0) panicLevel--;
  }

  const panicDraw = (p5) => {
    p5.background(0, 60, 63);
    if (panicLevel >= 7) {
      if (panicLevelCurrent < panicLevel) {
        const redLevel = (255) * (panicLevel/10) * (panicLevelCurrent/panicLevel);
        const greenLevel = 255 - (255 * panicLevelCurrent/panicLevel);
        p5.fill(redLevel,greenLevel,0)
        panicLevelCurrent += .1;
      }
    } else if (panicLevel < 7) {
      if (panicLevelCurrent > panicLevel) {
        const redLevel = (255) - (255 * ((10 - panicLevelCurrent)/(10 - panicLevel)));
        const greenLevel = (255 * ((10-panicLevel)/10) * ((panicLevelCurrent)))
        p5.fill(redLevel,greenLevel,0);
      }
      p5.fill(0,255,0);
    }
    p5.translate (10, 10, -200);
    p5.noStroke();
    p5.rotateX(angle);
    p5.rotateY(angle * 1.3);
    p5.rotateZ(angle * 0.7);
    p5.box(100);
    angle += 0.03;
  };

  const [messages, setMessages] = useState(script.messages);

  return (
      <ArwesThemeProvider>
        <StylesBaseline styles={{body: { fontFamily: "Titillium Web" }}}/>
        <main>
          <title>Home Page</title>
          <div style={{position: "fixed", top: "20px"}}>
            <FrameBox>
              <Sketch setup={panicSetup} draw={panicDraw} />
            </FrameBox>
            <br/>
            <Button onClick={panicUp}>up</Button>
            <Button onClick={panicDown}>down</Button>
          </div>
          <Grid>
            { messages.map((message) => {
              return (
                    <TextGraphic selectedText={message} constant={message.constant}></TextGraphic>
                  )
            })}
          </Grid>

        </main>
      </ArwesThemeProvider>
  )
}

export default IndexPage
