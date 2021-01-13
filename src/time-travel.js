import React,{useReducer} from 'react';
import produce from 'immer'

const UNDO = Symbol("UNDO");


const REDO = Symbol("REDO");


const RESET = Symbol("RESET");


function action_undo(timeline) {
  return produce(timeline, function (draft) {
    if (!draft.past.length) {
      return;
    }
    const newPresent = draft.past.pop();
    draft.future.unshift(draft.present);
    draft.present = newPresent;
  });
}


function action_redo(timeline) {
  return produce(timeline, function (draft) {
    if (!draft.future.length) {
      return;
    }
    const newPresent = draft.future.shift();
    draft.past.push(draft.present);
    draft.present = newPresent;
  });
}


function action_reset(timeline) {
  return produce(timeline, function (draft) {
    if (!draft.past.length) {
      return;
    }
    const newPresent = draft.past.shift();
    draft.future = [...draft.past, draft.present, ...draft.future];
    draft.future = [];
    draft.present = newPresent;
    draft.past = [];
  });
}


function action_step(timeline, newPresent) {
  return produce(timeline, function (draft) {
    draft.past.push(draft.present);
    draft.present = newPresent;
    draft.future = [];
  });
}


function timeline_reduce_fn(reducer) {
  return function (timeline, action) {
    if (action === UNDO) {
      return action_undo(timeline);
    } else if (action === REDO) {
      return action_redo(timeline);
    } else if (action === RESET) {
      return action_reset(timeline);
    } else {
      const newPresent = produce(timeline.present, function (draft) {
        reducer(draft, action);
      });
      return action_step(timeline, newPresent);
    }
  };
}


function useTimeTravel(reducer, state) {
  const initial = { past: [], present: state, future: [] };
  const [timeline, dispatch] = useReducer(timeline_reduce_fn(reducer), initial);
  return {
    now: timeline.present,
    timeline: timeline,
    fn: {
      dispatch: dispatch,
      undo: function () {
        dispatch(UNDO);
      },
      redo: function () {
        dispatch(REDO);
      },
      reset: function () {
        dispatch(RESET);
      },
    },
  };
}


export default useTimeTravel