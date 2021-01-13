import _ from 'lodash';
import React,{useState} from 'react';
import blessed from 'blessed';
import {render} from 'react-blessed';
import useTimeTravel from './time-travel'

function Screen() {
  const screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
    title: "Tui Grid History",
  });
  screen.key(["q", "C-c", "Esc"], function () {
    this.destroy();
  });
  return screen;
}


function GridControl(props) {
  return (
    <box>
      <box shrink={true}>
        <button
          left={7}
          top={0}
          content="U"
          shrink={true}
          mouse={true}
          onPress={function () {
            props.fn.up();
          }}
          padding={{ top: 1, right: 3, bottom: 1, left: 3 }}
          style={{ fg: "white", bg: "grey", focus: { bold: true } }}
        ></button>
        <button
          left={7}
          top={6}
          content="D"
          shrink={true}
          mouse={true}
          onPress={function () {
            props.fn.down();
          }}
          padding={{ top: 1, right: 3, bottom: 1, left: 3 }}
          style={{ fg: "white", bg: "grey", focus: { bold: true } }}
        ></button>
        <button
          left={0}
          top={3}
          content="L"
          onPress={function () {
            props.fn.left();
          }}
          shrink={true}
          mouse={true}
          padding={{ top: 1, right: 3, bottom: 1, left: 3 }}
          style={{ fg: "white", bg: "grey", focus: { bold: true } }}
        ></button>
        <button
          left={14}
          top={3}
          content="R"
          shrink={true}
          onPress={function () {
            props.fn.right();
          }}
          mouse={true}
          padding={{ top: 1, right: 3, bottom: 1, left: 3 }}
          style={{ fg: "white", bg: "grey", focus: { bold: true } }}
        ></button>
      </box>
    </box>
  );
}


function TimeControl({ global }) {
  let canUndo = global.timeline.past.length != 0;
  let canRedo = global.timeline.future.length != 0;
  return (
    <box shrink={true}>
      <button
        content="UNDO"
        shrink={true}
        mouse={true}
        onPress={function () {
          global.fn.undo();
        }}
        padding={{ top: 1, right: 1, bottom: 1, left: 1 }}
        style={{
          bg: canUndo ? "green" : "black",
          fg: canUndo ? "white" : "gray",
          focus: { bold: true },
        }}
      ></button>
      <button
        left={6}
        content="REDO"
        shrink={true}
        mouse={true}
        onPress={function () {
          global.fn.redo();
        }}
        padding={{ top: 1, right: 1, bottom: 1, left: 1 }}
        style={{
          bg: canRedo ? "blue" : "black",
          fg: canRedo ? "white" : "gray",
          focus: { bold: true },
        }}
      ></button>
      <button
        left={14}
        content="RESET"
        onPress={function () {
          global.fn.reset();
        }}
        shrink={true}
        mouse={true}
        padding={{ top: 1, right: 1, bottom: 1, left: 1 }}
        style={{ bg: "grey", fg: "white", focus: { bold: true } }}
      ></button>
    </box>
  );
}


const INITIAL = { x: 3, y: 3 };


function movement_reducer(state, action) {
  if (action.type === "RESET") {
    return INITIAL;
  } else if (action.type === "MOVE") {
    state.x = (state.x + action.x + 8) % 8;
    state.y = (state.y + action.y + 8) % 8;
  }
}


function GridView({ global }) {
  return (
    <box
      label={" Current [" + global.now.x + "," + global.now.y + "] "}
      width={36}
      height={18}
      border="line"
    >
      <box
        bg="yellow"
        width={4}
        height={2}
        left={4 * global.now.x}
        top={2 * global.now.y}
      ></box>
    </box>
  );
}


function HistoryView({ global }) {
  let tm = global.timeline;
  let cursor = tm.past.length;
  return (
    <box
      label={" All [" + (cursor + 1 + tm.future.length) + "] "}
      width={36}
      height={30}
      scrollable={true}
      border="line"
    >
      <log>
        {tm.past.map(function (e, i) {
          return (
            <text top={i} key={i}>
              {" " + JSON.stringify([e.x, e.y])}
            </text>
          );
        })}
        {tm.present ? (
          <text
            top={cursor}
            key={cursor}
            content={" " + JSON.stringify([tm.present.x, tm.present.y])}
            style={{ fg: "black", bold: true, bg: "yellow" }}
            shrink={true}
          ></text>
        ) : (
          <text top={cursor}></text>
        )}
        {tm.future.map(function (e, i) {
          return (
            <text top={cursor + 1 + i} key={cursor + 1 + i}>
              {" " + JSON.stringify([e.x, e.y])}
            </text>
          );
        })}
      </log>
    </box>
  );
}


function App() {
  const tm = useTimeTravel(movement_reducer, INITIAL);
  const createMove = function (x, y) {
    return function () {
      tm.fn.dispatch({ type: "MOVE", x: x, y: y });
    };
  };
  const fns = _.mapValues({
    up: createMove(0, -1),
    down: createMove(0, 1),
    left: createMove(-1, 0),
    right: createMove(1, 0),
  });
  return (
    <box>
      <box left={2} top={1}>
        <box top={0}>
          <GridView global={tm}></GridView>
        </box>
        <box top={20} left={7}>
          <GridControl global={tm} fn={fns}></GridControl>
        </box>
      </box>
      <box left={42} top={1} shrink={true}>
        <box top={0}>
          <HistoryView global={tm}></HistoryView>
        </box>
        <box top={25} left={7} shrink={true}>
          <TimeControl global={tm} fn={fns}></TimeControl>
        </box>
      </box>
    </box>
  );
}


function main() {
  render(<App></App>, Screen());
}


main()