import React, { useState } from "react"
import {
  ArwesThemeProvider,
  Button,
  FrameBox,
  StylesBaseline,
  List,
  FrameHexagon,
  Text,
  FramePentagon
} from "@arwes/core";
import Sketch from "react-p5";

import { Grid, Row, Col } from 'react-flexbox-grid';
import script from "../script.json"
import "@fontsource/titillium-web";

let angle = 0;
let panicLevel = 5;
let panicLevelCurrent = 0;
const TextGraphic = (props) => {
  const words = [] // store word objects
  let selectedWord = null;
  let hasBeenSent = false;
  const initialX = 10;
  const initialY = 30;
  let globalP5 = null;
  const preload = (p5) => {
    p5.fontRegular = p5.loadFont("/static/fonts/TitilliumWeb-Regular.ttf");
    p5.fontItalic = p5.loadFont("/static/fonts/TitilliumWeb-Italic.ttf");
    p5.fontBold = p5.loadFont("/static/fonts/TitilliumWeb-Bold.ttf");
  }
  const setup = (p5, canvasParentRef) => {
    // use parent to render the canvas in this ref
    // (without that p5 will render the canvas outside of your component)
    p5.createCanvas(1164, 400).parent(canvasParentRef);
    p5.background(0, 60, 63);
    globalP5 = p5;
    updateWords(p5);
  };
  const calculateFinalize = () => {
    if (!hasBeenSent) {
      hasBeenSent = true;
      let redCount = 0;
      words.forEach((word) => {
        if (word.replacements) {
          if (word.origWord) redCount++;
        }
        word.fColor = globalP5.color(155,155,155)
      })
      panicLevel+=redCount;

    }
  }

  const updateWords = (p5) => {
    p5.textSize(18)
    p5.textFont(p5.fontRegular);
    // track word position
    let x = initialX;
    let y = initialY;
    p5.fill(255)
    let wordsStr = [];
    props.selectedText.text.forEach((txtSegment) => {
      if (txtSegment.replace) {
        wordsStr = [txtSegment.txt];
      } else {
        wordsStr = txtSegment.txt.split(' ');
      }
      // iterate over each word
      for (let i = 0; i < wordsStr.length; i++) {
        const wordStr = wordsStr[i] // get current word
        const wordStrWidth = p5.textWidth(wordStr); // get current word width
        let word = null;
        if (txtSegment.replace) { word = new Word(wordStr, x, y, i, true, p5.color(255, 0, 0),
            txtSegment.replace, p5) }
        else { word = new Word(wordStr, x, y, i, false, p5.color(255), null, p5) }
        words.push(word)
        x = x + wordStrWidth + p5.textWidth(' ') // update x by word width + space character
        // look ahead the next word - will it fit in the space? if not, line break
        const nextWordStrWidth = p5.textWidth(wordsStr[i+1]) || 0
        if (x > (p5.width - initialX) - nextWordStrWidth) {
          y += p5.textAscent(words[0].word) + 10 // line height, sort of
          x = initialX // reset x position
        }
      }
    })
    p5.resizeCanvas(1164, y + 20)
  }
  const draw = (p5) => {
    p5.background(0, 60, 63);
    for (let i = 0; i < words.length; i++) {
      const word = words[i] // retrieve word object
      if (word !== selectedWord) {
        word.update()
      } else {
        word.moveTo(p5.mouseX - word.offsetX, p5.mouseY + word.offsetY);
      }
      word.display()
    }

  };

  const keyPressed = (p5) => {
    if (p5.key === 'r' && !props.constant) {
      for (let word of words) word.spread()
    } else if (p5.key === ' ') {
      for (let word of words) word.reset()
    }
  }

  const mousePressed = (p5) => {
    let wordEndX = 0;
    let wordEndY = 0;
    for (let i = 0; i < words.length; i++) {
      wordEndX = p5.textWidth(words[i].word) + words[i].x;
      wordEndY = words[i].y - p5.textAscent(words[i].word);
      if (p5.mouseX > words[i].x && p5.mouseX < wordEndX && p5.mouseY < words[i].y && p5.mouseY > wordEndY) {
        selectedWord = words[i];
        selectedWord.offsetX = p5.mouseX - words[i].x;
        selectedWord.offsetY =  words[i].y - p5.mouseY;
        if (selectedWord) {
          console.log(selectedWord.word + " picked up.");
        }
      }
    }
  }

  const mouseReleased = (p5) => {
    if (selectedWord) {
      if (selectedWord.replacements == null) {
        selectedWord.tx = p5.mouseX - selectedWord.offsetX;
        selectedWord.ty = p5.mouseY + selectedWord.offsetY;
      }
      if (p5.mouseX > p5.width || p5.mouseX < 0 || p5.mouseY > p5.height || p5.mouseY < 0) {
        console.log("Outside");
        /* Remove word
        let indx = words.indexOf(selectedWord);
        if (indx !== -1) {
          words.splice(indx, 1);
        } */
        if (selectedWord.replacements) {
          selectedWord.changeWord(p5.random(selectedWord.replacements), p5);
        } else {
          selectedWord.reset()
        }
      }

    }
    selectedWord = null;
  }

  class Word {
    constructor(word, x, y, idx, draggable, fColor, replacements, p5) {
      this.word = word;
      this.x = x;
      this.y = y;
      // target position is the same as current position at start
      this.tx = this.x;
      this.ty = this.y;
      // original position
      this.origx = this.x;
      this.origy = this.y;
      // offset to track where the word was clicked (prevents the word from jumping as you click)
      this.offsetX = this.x;
      this.offsetY = this.y;
      // draggable
      this.draggable = draggable;
      // is it in original state
      this.origState = true;
      this.origWord = true;
      // what to replace
      this.replacements = replacements;
      this.idx = idx;
      this.p5 = p5;
      this.fColor = fColor;
    }

    reset() {
      this.tx = this.origx;
      this.ty = this.origy;
      this.origState = true;
    }

    spread() {
      this.tx = (this.p5.random(this.p5.width-30)+20);
      this.ty = (this.p5.random(this.p5.height-30)+20);
      this.origState = false;
    }

    update() {
      // move towards the target by 10% each time
      this.x = this.p5.lerp(this.x, this.tx, 0.1)
      this.y = this.p5.lerp(this.y, this.ty, 0.1)
    }

    display() {
      this.p5.fill(this.fColor)
      this.p5.noStroke()
      this.p5.text(this.word, this.x, this.y)
    }

    moveTo(x, y) {
      this.x = x;
      this.y = y;
    }

    changeWord(word, p5) {
      if (!word.draggable) {
        this.word = word;
        this.origWord = false;
        this.fColor = this.p5.color(0, 255, 0);
        let indx = words.indexOf(this);
        // If for some reason the word can't be found.
        if (indx !== -1) {
          let x = this.origx
          let y = this.origy;
          if (this.origState) {
            for (let i = indx; i < words.length; i++) {
              const wordStrWidth = p5.textWidth(words[i].word); // get current word width
              if (x + wordStrWidth > p5.width) {
                y += p5.textAscent(words[0].word)
                x = initialX;
              }

              words[i].tx = x;
              words[i].ty = y;
              words[i].origx = x;
              words[i].origy = y;
              x = x + wordStrWidth + p5.textWidth(' ') // update x by word width + space character
              // look ahead the next word - will it fit in the space? if not, line break
              const nextWordStrWidth = p5.textWidth(words[i+1]) || 0
              if (x > p5.width - nextWordStrWidth) {
                y += p5.textAscent(words[0].word) + 10// line height, sort of
                x = initialX // reset x position
              }
            }
          }
        }

      }

    }
  }

  return (
      <>
        <Row key={props.selectedText.key}>
          <Row style={{paddingTop: "20px"}}>
            <Col>
              <FramePentagon style={{width: "1184px"}}>
                <div>
                  <Text as={"h4"} style={{marginBottom: "0px"}}>Origin: {props.selectedText.origin}</Text>
                  <br/>
                  <Text as={"span"}>Encryption: {props.selectedText.encryption}</Text>
                </div>
              </FramePentagon>
            </Col>
          </Row>
          <Row style={{paddingTop: "20px"}}>
            <Col>
              <FramePentagon style={{width: "1184px"}}>
                <div>
                  <Text as={"h4"}  style={{marginBottom: "0px"}}>Destination: {props.selectedText.dest}</Text>
                </div>
              </FramePentagon>
            </Col>
          </Row>
          <Row style={{paddingTop: "20px"}}>
            <Col>
              <FrameBox>
                <Sketch preload={preload} setup={setup} draw={draw} keyPressed={keyPressed} mousePressed={mousePressed}
                        mouseReleased={mouseReleased}/>
              </FrameBox>
            </Col>
          </Row>
          {!props.selectedText.constant &&
          <Row style={{paddingTop: "20px"}} end={"xs"} >
            <Button palette={"primary"} FrameComponent={FramePentagon} onClick={calculateFinalize}><Text>Send</Text></Button>
          </Row>
          }
        </Row>
      </>
  );
};
// markup
const IndexPage = () => {
  const panicSetup = (p5, canvasParentRef) => {
    // use parent to render the canvas in this ref
    // (without that p5 will render the canvas outside of your component)
    p5.createCanvas(120, 120, p5.WEBGL).parent(canvasParentRef);
  };

  const panicUp = () => {
    if (panicLevel < 10) panicLevel++;
    console.log(panicLevel)
  }
  const panicDown = () => {
    if (panicLevel > 0) panicLevel--;
  }

  const panicDraw = (p5) => {
    p5.background(0, 60, 63);
    if (panicLevel > 9) {
      p5.background(255, 0, 0);
      p5.fill(255,255,255)
      return;
    }
    if (panicLevel >= 7) {
      if (panicLevelCurrent < panicLevel) {
        const redLevel = (255) * (panicLevel/10) * (panicLevelCurrent/panicLevel);
        const greenLevel = 255 - (255 * panicLevelCurrent/panicLevel);
        p5.fill(redLevel,greenLevel,0)
        panicLevelCurrent += .3;
      }
    } else if (panicLevel < 7) {
      if (panicLevelCurrent > panicLevel) {
        const redLevel = (255) - (255 * ((10 - panicLevelCurrent)/(10 - panicLevel)));
        const greenLevel = (255 * ((10-panicLevel)/10) * ((panicLevelCurrent)))
        panicLevelCurrent -= .1;
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
