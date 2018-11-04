import React, {Component} from 'react';
import styled from 'styled-components';

import {STATUS} from '../../constants';
import {COLORS} from '../../styles/variables';
import {
    parseScoreColor,
    parseScoreBorderColor,
} from '../../services/data.service';

export const ScoreItem = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  min-height: 50px;
  font-size: 30px;
  font-weight: bold;
  color: ${(props) => parseScoreColor(props)};
  padding-left: 30px;
  border-left: 20px solid ${(props) => parseScoreBorderColor(props)};
  border-radius: 5px;
  i {
    &.status {
      will-change: contents;
      margin-right: 3px;
      margin-left: -26px;
    }
    &.default {
      color: darkgrey;
    }
    &.failure {
      color: red;
      animation: blink 1s steps(1) infinite;
    }
    &.move {
      color: rgba(86,200,66,0.89);;
    }
    &.wait_for_command {
      color: rgba(0,195,255,0.69);;
      animation: blink 2.5s steps(1) infinite;
    }
  }
  .leader_board {
    margin-left: 3px;
    font-weight: bold;
    color: deeppink;
  }
    @keyframes blink { 50% { color: transparent; } }
    @-webkit-keyframes blink { 50% { color: transparent; } }
`;

const Speed = styled.span`
  font-size: 1.1rem;
  color: ${props => props.speedFactor > 0 ? COLORS.speedBoost[0] : COLORS.red};
  padding-left: 5px;
  i {
    font-size: 1.2rem;
  }
  span {
    margin-top: -5px;
  }
`;

export class Score extends Component {
    isDefaultStatus() {
        return !this.hasTopicUrl() && !this.hasCommand();
    }

    hasTopicUrl() {
        return !!this.props.topicUrl;
    }

    hasCommand(status) {
        return (
            status
                ? this.props.command && this.props.command.name === status
                : !!this.props.command && !!this.props.command.name
        );
    }

    renderDefaultStatus() {
        return (
            this.isDefaultStatus()
                ? <i className="material-icons status default">live_help</i>
                : null
        )
    }

    renderReadyStatus() {
        return (
            this.hasTopicUrl() &&
            !this.hasCommand()
                ? <i className="material-icons status wait_for_command">timelapse</i>
                : null
        )
    }

    renderMoveStatus() {
        return (
            this.hasTopicUrl() &&
            this.hasCommand(STATUS.MOVE)
                ? <i className="material-icons status move">fast_forward</i>
                : null
        )
    }

    renderFailureStatus() {
        return (
            this.hasCommand(STATUS.READY_FAILED)
                ? <i className="material-icons status failure">broken_image</i>
                : null
        );
    }

    renderSpeed() {
        const speedFactor = this.props.distancePerTick ? Math.round((this.props.distancePerTick / 0.05) - 6) : 0;
        return (
            speedFactor && speedFactor !== 0
                ? <Speed speedFactor={speedFactor}>
                    <i className="material-icons">flash_on</i>
                    <span>{ speedFactor }</span>
                </Speed>
                : null
        );
    }

    renderLeaderBoard() {
        switch (this.props.index) {
            default:
                return null;
            case 0:
                return (
                    this.props.score > 0 &&
                    (this.props.isPreviousDraw || this.props.index === 0) ?
                        <span className="leader_board leader_1">
                        <i className="material-icons leader_board leader_1">star</i>
                        1
                    </span>
                        : null
                );
            case 1:
                return (
                    this.props.score > 0 &&
                    (this.props.isPreviousDraw || this.props.index === 1) ?
                        <span className="leader_board leader_2">
                        <i className="material-icons leader_board leader_2">star_half</i>
                        2
                    </span>
                        : null
                );
            case 2:
                return (
                    this.props.score > 0 &&
                    (this.props.isPreviousDraw || this.props.index === 2) ?
                        <span className="leader_board leader_3">
                        <i className="material-icons leader_board leader_3">star_border</i>
                        3
                    </span>
                        : null
                );
        }
    }

    render() {
        return (
            <ScoreItem
                {...this.props}
                failure={this.hasCommand(STATUS.READY_FAILED)}
                default={this.isDefaultStatus()}
            >
                {
                    this.renderMoveStatus() ||
                    this.renderReadyStatus() ||
                    this.renderFailureStatus() ||
                    this.renderDefaultStatus()
                }
                {this.props.score || 0}
                {this.renderSpeed()}
                {this.renderLeaderBoard()}
            </ScoreItem>
        );
    }
}
