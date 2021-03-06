import React, { Component } from 'react';
import styled from 'styled-components';

import {COLORS} from '../../styles/variables';
import {GAME_PARAMETERS, STATUS} from '../../constants';
import { CustomMapElement } from '../CustomMapElement';
import PinSprite from '../PinSprite';
import {CounterBubble} from '../CounterBubble';
import {parseDroneTeamColor} from '../../services/data.service';

export const PinContainer = styled.div`
  div {
    svg {
      margin-top: calc(-${GAME_PARAMETERS.pin} / 2);
      margin-left: calc(-${GAME_PARAMETERS.pin} / 2);
      width: ${GAME_PARAMETERS.pin};
      height: ${GAME_PARAMETERS.pin};
      fill: ${(props) => COLORS[parseDroneTeamColor(props.teamId)]};
      filter: drop-shadow(2px 6px 4px rgba(0,0,0,0.8));
    }
  }
`;

export class Pin extends Component {
    renderParcelScoreCounter() {
        return (
            this.props.score !== undefined  &&
            <CounterBubble {...this.props} addMargin='pin'>
                {this.props.score}
            </CounterBubble>
        );
    }

    render() {
        return (
            this.props.status &&
            (
                this.props.status === STATUS.TOGGLE ||
                this.props.status === STATUS.GRABBED
            ) ?
            <CustomMapElement>
                <PinContainer {...this.props} >
                    <PinSprite/>
                    {this.renderParcelScoreCounter()}
                </PinContainer>
            </CustomMapElement>
            : null
        );
    }


}
