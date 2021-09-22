import React from "react"
import Sketch from "react-p5";
import {Col, Row} from "react-flexbox-grid";
import {Button, FrameBox, FramePentagon, Text} from "@arwes/core";


const TextGraphic = (props) => {
  const words = [] // store word objects
  let selectedWord = null;
  let selectedOffset = { x: 0, y: 0 }
  const initialX = 10;
  const initialY = 30;
  const preload = (p5) => {
    console.log("hello");
    p5.fontRegular = p5.loadFont("/static/fonts/TitilliumWeb-Regular.ttf");
    p5.fontItalic = p5.loadFont("/static/fonts/TitilliumWeb-Italic.ttf");
    p5.fontBold = p5.loadFont("/static/fonts/TitilliumWeb-Bold.ttf");
  }
  const setup = (p5, canvasParentRef) => {
    // use parent to render the canvas in this ref
    // (without that p5 will render the canvas outside of your component)
    p5.createCanvas(1164, 400).parent(canvasParentRef);
    p5.background(0, 60, 63)
    updateWords(p5);
  };

  const updateWords = (p5) => {
    p5.textSize(24)
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
      if (p5.mouseX > words[i].x && p5.mouseX < wordEndX && p5.mouseY < words[i].y && p5.mouseY > wordEndY
          && words[i].draggable) {
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
      if (p5.mouseX > p5.width || p5.mouseX < 0 || p5.mouseY > p5.height || p5.mouseY < 0) {
        console.log("Outside");
        /* Remove word
        let indx = words.indexOf(selectedWord);
        if (indx !== -1) {
          words.splice(indx, 1);
        } */
        selectedWord.changeWord(p5.random(selectedWord.replacements), p5);
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
      this.tx = this.p5.random(this.p5.width);
      this.ty = this.p5.random(this.p5.height);
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
      this.word = word;
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
            } else {
              y = y;
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
              <Button palette={"primary"} FrameComponent={FramePentagon}><Text>Send</Text></Button>
            </Row>
          }
        </Row>
      </>
  );
};

export default TextGraphic