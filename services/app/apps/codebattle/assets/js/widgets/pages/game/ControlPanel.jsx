import React from 'react';
import { useDispatch } from 'react-redux';
import { PlayerIcon } from 'react-player-controls';
import cn from 'classnames';
import Gon from 'gon';
import copy from 'copy-to-clipboard';
import { actions } from '../../slices';
import speedModes from '../../config/speedModes';
import { replayerMachineStates } from '../../machines/game';

const gameId = Gon.getAsset('game_id');

function ControlPanel({
  roomCurrent,
  onPauseClick,
  onPlayClick,
  onChangeSpeed,
  children,
  nextRecordId,
}) {
  const dispatch = useDispatch();

  const { speedMode } = roomCurrent.context;
  const isPaused = !roomCurrent.matches({ replayer: replayerMachineStates.playing });

  const speedControlClassNames = cn('btn btn-sm rounded ml-2 border rounded-lg', {
    'btn-light': speedMode === speedModes.normal,
    'btn-secondary': speedMode === speedModes.fast,
  });

  const onControlButtonClick = () => {
    switch (true) {
      case roomCurrent.matches({ replayer: replayerMachineStates.ended }):
      case roomCurrent.matches({ replayer: replayerMachineStates.paused }):
        onPlayClick();
        break;
      case roomCurrent.matches({ replayer: replayerMachineStates.playing }):
        onPauseClick();
        break;
      default:
        dispatch(actions.setError(new Error('unexpected game state [players ControlPanel]')));
    }
  };

  return (
    <>
      <button
        type="button"
        className="mr-4 btn btn-light rounded-lg"
        onClick={onControlButtonClick}
      >
        {isPaused ? (
          <PlayerIcon.Play width={32} height={32} />
        ) : (
          <PlayerIcon.Pause width={32} height={32} />
        )}
      </button>
      {children}
      <div className="dropup ml-2">
        <button
          className="btn btn-light px-2 ml-1 shadow-none d-flex rounded-lg"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <i className="fas fa-cog" />
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <div className="d-flex">
            <button type="button" className={speedControlClassNames} onClick={onChangeSpeed}>x2</button>
            <button
              type="button"
              className="btn btn-sm rounded ml-2 border btn-light rounded-lg"
              title="Copy history game url at current record id"
              onClick={() => {
                const url = `https://codebattle.hexlet.io/games/${gameId}?t=${nextRecordId}`;
                copy(url);
              }}
            >
              <i className="fas fa-link" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ControlPanel;