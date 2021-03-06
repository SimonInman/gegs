import uuid from 'uuid';
import * as gridUtils from '../grid/grid';

const initialGrid = gridUtils.makeGrid(gridUtils.GRID_SIZE);
const initialCrosswordState = {
  grid: initialGrid,
  clues: gridUtils.gridClueLocations(initialGrid),
  cursor: [0, 0],
  direction: 'right',
  name: 'Unnamed',
  fixGrid: false,
  clueBank: [
    {answer: 'AUSTIN', clue: 'Absolute badman!'}
  ]
}

const DIR_TO_DELTA = {
  'up': [-1, 0],
  'down': [1, 0],
  'left': [0, -1],
  'right': [0, 1]
}

const moveCursor = ([rD, cD], [row, col]) => {
  return [
    Math.min(gridUtils.GRID_SIZE-1, Math.max(0, row + rD)),
    Math.min(gridUtils.GRID_SIZE-1, Math.max(0, col + cD))
  ]
}

const oppositeDirection = (direction) => {
  const mapping = {
    'down': 'up',
    'up': 'down',
    'left': 'right',
    'right': 'left'
  }
  return mapping[direction];
}

const crossword = (state = initialCrosswordState, action) => {

  const {grid, cursor: [row, col], clueBank, direction, fixGrid} = state;

  switch (action.type) {

    case 'SET_GRID_CURSOR':
    {
      const {cursor: [newRow, newCol]} = action;
      const newDirection = (newRow === row) && (newCol === col) ? (direction === 'right' ? 'down' : 'right') : direction;
      return {
        ...state,
        cursor: [newRow, newCol],
        direction: newDirection
      }
    }

    case 'MOVE_GRID_CURSOR':
    {
      const delta = DIR_TO_DELTA[action.direction];
      const newCursor = moveCursor(delta, [row, col]);
      const newDirection = action.direction === 'down' || action.direction === 'right' ? action.direction : direction;
      return {
        ...state,
        cursor: newCursor,
        direction: newDirection
      }
    }

    case 'MOVE_GRID_BACK':
    {
      const newGrid = gridUtils.placeValue(grid, row, col, ' ');
      const delta = DIR_TO_DELTA[oppositeDirection(direction)];
      const newCursor = moveCursor(delta, [row, col]);
      return {
        ...state,
        grid: newGrid,
        cursor: newCursor,
      }
    }

    case 'SET_GRID_VALUE':
    {
        const newGrid = gridUtils.placeValue(grid, row, col, action.value, fixGrid);
        const clues = gridUtils.gridClueLocations(newGrid);
        const delta = DIR_TO_DELTA[direction];
        const newCursor = moveCursor(delta, [row, col]);
        return {
          ...state,
          grid: newGrid,
          clues: clues,
          cursor: newCursor
        }
    }

    case 'ADD_CLUE_TO_BANK':
        const newClueBankClue = {
          clue: action.clue,
          answer: action.answer,
          id: uuid.v4()
        }
        const newClueBank = [...clueBank, newClueBankClue];
        return {
          ...state,
          clueBank: newClueBank,
        }

    case 'DELETE_CLUE_FROM_BANK':
    {
      const newClueBank = clueBank.filter(clue => clue.id !== action.clueId);
      return {
        ...state,
        clueBank: newClueBank,
      }
    }

    case 'SET_FIX_GRID_STATUS':

        return {
          ...state,
          fixGrid: action.fixGridstatus
        }

    case 'CHANGE_CROSSWORD_NAME':

        return {
          ...state,
          name: action.name
        }

    default:
      return state
  }
}

const crosswordId = uuid.v4();
const initialCrosswordsState = {
  currentCrosswordId: crosswordId,
  crosswords: {
    [crosswordId]: initialCrosswordState,
    // 2: initialCrosswordState
  },
  isNavOpen: false
}

const crosswords = (state = initialCrosswordsState, action) => {
  const {currentCrosswordId, crosswords} = state;
  switch (action.type) {
    case 'SELECT_CROSSWORD':
      return {
        ...state,
        currentCrosswordId: action.crosswordId
      };
    case 'DELETE_CROSSWORD':
    {
      let newCrosswords = crosswords;
      delete newCrosswords[action.crosswordId];
      const newCurrentCrosswordId = Object.keys(newCrosswords)[0];
      return {
        ...state,
        currentCrosswordId: newCurrentCrosswordId,
        crosswords: newCrosswords
      };
    }
    case 'NEW_CROSSWORD':
    {
        const crosswordId = uuid.v4();
        return {
          ...state,
          currentCrosswordId: crosswordId,
          crosswords: {
            ...crosswords,
            [crosswordId]: initialCrosswordState,
          }
        }
    }
    case 'SET_NAV_OPEN':
      return {
        ...state,
        isNavOpen: action.isOpen
      };
    default:
    {
      const currentCrossword = crosswords[currentCrosswordId];
      const newCurrentCrossword = crossword(currentCrossword, action);
      let newCrosswords = crosswords;
      newCrosswords[currentCrosswordId] = newCurrentCrossword;
      return {
        ...state,
        crosswords: newCrosswords
      }
    }
  }
}

export default crosswords;
