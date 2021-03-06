import React, {Component} from 'react';
import styled from 'styled-components';
import GoogleMapReact from 'google-map-react';
import {get} from 'lodash';

import { Section } from '../../components/Section';
import { Drone } from '../../components/Drone';
import { Parcel } from '../../components/Parcel';
import { Pin } from '../../components/Pin';
import { PinDestination } from '../../components/PinDestination';
import {
    Score,
    ScoreItem,
} from '../../components/Score';
import {
    getDronesAndParcels,
    parseDroneInfo,
    parseParcelInfo,
    parseScores,
    parseDroneTeamColor,
} from '../../services/data.service';
import {
    GAME_PARAMETERS,
    STATUS,
} from '../../constants';
import {
    mockedDronesAndParcels_1,
    mockedDronesAndParcels_2,
} from '../../mockedDroneAndParcels';

const Actions = Section.extend`
  height: 50px;
`;

const GoogleMapContainer = styled.div`
  display: flex;
  flex: 1 1 950px;
  overflow: hidden;
  height: 860px;
  border-radius: 15px;
`;

const ScoresContainer = styled.div`
  display: flex;
  flex: 0 1 220px;
  flex-flow: column nowrap;
  align-items: flex-start;
  padding: 0 5px 0 5px;
  margin-left: 10px;
  overflow: hidden;
  // TODO change depending of screen size 
  height: 860px;
  &:hover {
    overflow: auto;
  }
  ${ScoreItem}:not(:last-of-type) {
    margin-bottom: 10px;
  }
`;

const Filter = styled.div`
  background: rgba(0, 0, 0, .2);
  width: 100%;
  height: 100%;
`;

export class GameDashboard extends Component {
    static defaultProps = {
        ...GAME_PARAMETERS,
    };

    constructor(props) {
        super(props);
        this.state = {
            // drones: createDrones(3),
            drones: [],
            parcels: [],
            build: props.build,
            filter: '',
        };
    }

    componentDidMount() {
        this.initUpdater();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    initUpdater = async () => {
        this.timer = setInterval(async () => {
            try {
                // this.moveDrones();
                const dronesAndParcels = await getDronesAndParcels();
                // const dronesAndParcels = await Promise.resolve(mockedDronesAndParcels_2);
                this.updateGame(dronesAndParcels || {drones: [], parcels: []});
            } catch (e) {
            }
        }, this.props.speed);
    };

    log() {
        this.props.logLevel && this.props.logLevel === 'debug' && console.log(this.state);
    }
    filterTeam = (teamId) => {
        if (this.state.filter && this.state.filter === teamId) {
            this.setState({ filter: ''});
        } else {
            this.setState({ filter: teamId});
        }
    };

    updateGame = ({drones, parcels}) => {
        const dronesNext = parseDroneInfo(drones || []);
        const parcelsNext = parcels ? parseParcelInfo(parcels) : [];
        this.setState({
            drones: dronesNext,
            parcels: parcelsNext,
        }, this.log);
    };

    renderBoundaries(type = 'inner') {
        const boundaries = this.props[`${type}Boundaries`];
        return boundaries.map((boundary, index) => (
            <Pin
                key={`boundary-${index}`}
                lat={get(boundary, 'latitude')}
                lng={get(boundary, 'longitude')}
                status={STATUS.TOGGLE}
                teamId={type === 'inner' ? 'green' : type === 'middle' ? 'orange' : 'red'}
            />
        ))
    }

    renderLeaderBoard() {
        const scores = parseScores(this.state.drones)
            .filter(drone => {
                return (
                    this.state.filter === ''
                    || this.state.filter === drone.teamId
                );
            });
        let previousScore = 0;
        let nextScore = 0;
        let previousDraw = false;
        let previousIndex;
        return scores.map((drone, index) => {
            let scoreIndex = index;
            const currentScore = drone.score || 0;
            nextScore = scores[index + 1] ? (scores[index + 1].score || 0) : 0;
            const isDraw = currentScore === previousScore || currentScore ===  nextScore;
            const isPreviousDraw = previousDraw;
            if (
                isDraw &&
                currentScore === previousScore
            ) {
                scoreIndex = previousIndex;
            }
            if (
                isPreviousDraw &&
                currentScore < previousScore
            ) {
                scoreIndex = previousIndex + 1;
            }
            previousScore = currentScore;
            previousDraw = isDraw;
            previousIndex = scoreIndex;
            return (
                <Score
                    key={`score-${drone.teamId}-${index}`}
                    index={scoreIndex}
                    draw={isDraw}
                    isPreviousDraw={isPreviousDraw}
                    parcels={this.state.parcels}
                    drone={drone ? drone : {}}
                    onClick={() => this.filterTeam(drone.teamId)}
                />
            );
        });
    }

    render() {
        return (
            <Section>
                <GoogleMapContainer>
                    <GoogleMapReact
                        bootstrapURLKeys={{key: process.env.REACT_APP_GOOGLE_MAP_KEY}}
                        defaultCenter={this.props.center}
                        defaultZoom={this.props.zoom}
                        // onGoogleApiLoaded={({map, maps}) => this.renderPolylines(map, maps)}
                    >
                        {this.state.parcels
                            .filter(parcel => {
                                return (
                                    this.state.filter === ''
                                    || this.state.filter === parcel.teamId
                                );
                            })
                            .map((parcel, index) => [
                                <Pin
                                    {...parcel}
                                    key={`delivery-pin-${parcel.teamId}-${parcel.parcelId || index}`}
                                    lat={get(parcel, 'location.delivery.latitude')}
                                    lng={get(parcel, 'location.delivery.longitude')}
                                />,
                                <Parcel
                                    {...parcel}
                                    key={`parcel-${parcel.teamId}-${parcel.parcelId || index}`}
                                    lat={get(parcel, 'location.pickup.latitude')}
                                    lng={get(parcel, 'location.pickup.longitude')}
                                />,
                            ])
                        }
                        {this.props.showBoundaries ? this.renderBoundaries('inner') : null}
                        {this.props.showBoundaries ? this.renderBoundaries('outer') : null}
                        {this.props.showBoundaries ? this.renderBoundaries('middle') : null}
                        {this.state.drones
                            .filter(drone => {
                                return (
                                    this.state.filter === ''
                                    || this.state.filter === drone.teamId
                                );
                            })
                            .map((drone) => [
                            <Drone
                                {...drone}
                                key={drone.teamId}
                                lat={drone.latitude}
                                lng={drone.longitude}
                            />,
                            <PinDestination
                                key={`move-location-${drone.teamId}`}
                                lat={get(drone, 'command.location.latitude')}
                                lng={get(drone, 'command.location.longitude')}
                                teamId={parseDroneTeamColor(drone.teamId)}
                                status={STATUS.TOGGLE}
                                drone={drone}
                            />,
                            <Filter />
                        ])}
                    </GoogleMapReact>
                </GoogleMapContainer>
                <ScoresContainer>
                    {this.renderLeaderBoard()}
                </ScoresContainer>
                {/*
                <Actions>
                  <button onClick={this.stopDrone}>Stop</button>
                  <button onClick={this.initUpdater}>Start</button>
                </Actions>
                */}
            </Section>
        );
    }
}

// moveDrones() {
//   const updatedDrones = this.state.drones.map((drone) => {
//     return moveDrone(drone);
//   });
//   this.setState({
//     drones: updatedDrones,
//   });
// }
//
// stopDrone = () => {
//   clearInterval(this.timer);
// }

// renderPolylines(map, maps) {
//     /** Example of rendering geodesic polyline */
//     let geodesicPolyline = new maps.Polyline({
//         path: this.props.markers,
//         geodesic: true,
//         strokeColor: '#00a1e1',
//         strokeOpacity: 1.0,
//         strokeWeight: 4
//     })
//     geodesicPolyline.setMap(map)
//
//     /** Example of rendering non geodesic polyline (straight line) */
//     let nonGeodesicPolyline = new maps.Polyline({
//         path: this.props.markers,
//         geodesic: false,
//         strokeColor: '#e4e4e4',
//         strokeOpacity: 0.7,
//         strokeWeight: 3
//     })
//     nonGeodesicPolyline.setMap(map)
//
//     this.fitBounds(map, maps)
// }
//
// fitBounds(map, maps) {
//     var bounds = new maps.LatLngBounds()
//     for (let marker of this.props.markers) {
//         bounds.extend(
//             new maps.LatLng(marker.lat, marker.lng)
//         )
//     }
//     map.fitBounds(bounds)
// }

export default GameDashboard;
