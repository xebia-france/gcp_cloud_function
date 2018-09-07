import React, {Component} from 'react';
import styled from 'styled-components';
import GoogleMapReact from 'google-map-react';
import {get} from 'lodash';

import logo from './assets/logo.svg';
import { Drone } from './components/Drone';
import { Parcel } from './components/Parcel';
import { Pin } from './components/Pin';
import {
    Score,
    ScoresContainer,
} from './components/Score';
import {
    getDronesAndParcels,
    parseDroneInfo,
    parseParcelInfo,
    parseScores,
} from './services/drone.service';
import {
    GAME_PARAMETERS,
} from './constants';

const AppContainer = styled.div`
    text-align: center;
    padding: 0 40px;
    .App-logo {
      height: 40px;
    }

    .App-header {
      display: flex;
      flex: 1 1 950px;
      height: 60px;
      padding-top: 20px;
      padding-bottom: 20px;
      color: #333;
    }

    .App-title {
      font-size: 1.5em;
    }

    .App-intro {
      font-size: large;
    }
`;

const Section = styled.div`
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
  align-items: flex-start;
`;

const Actions = Section.extend`
  height: 50px;
`;

const GoogleMapContainer = styled.div`
  display: flex;
  flex: 1 1 950px;
  overflow: hidden;
  height: 600px;
  border-radius: 15px;
`;

class App extends Component {
    static defaultProps = {
        ...GAME_PARAMETERS,
        // data for polyline test
        // markers: [
        //     {lat: 53.42728, lng: -6.24357},
        //     {lat: 43.681583, lng: -79.61146}
        // ],
    };

    constructor() {
        super();
        this.state = {
            // drones: createDrones(3),
            drones: [],
            parcels: [],
        };
    }

    componentDidMount() {
        this.startDrone();
    }

    startDrone = async () => {
        this.timer = setInterval(async () => {
            // this.moveDrones();
            const dronesAndParcels = await getDronesAndParcels();
            this.updateGame(dronesAndParcels || {drones: [], parcels: []});
        }, this.props.speed);
    };

    updateGame = ({drones, parcels}) => {
        const dronesNext = parseDroneInfo(drones || []);
        const parcelsNext = parcels ? parseParcelInfo(parcels) : [];
        this.setState({
            drones: dronesNext,
            parcels: parcelsNext,
        }, console.log(this.state));
    };


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

    renderBoundaries() {
        return this.props.pinBoundaries.map((boundary, index) => (
            <Pin
                key={`boundary-${index}`}
                lat={get(boundary, 'latitude')}
                lng={get(boundary, 'longitude')}
                status={'admin'}
            />
        ))
    }

    render() {
        return (
            <AppContainer>
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Google Functions drones race</h1>
                </header>
                <Section>
                    <GoogleMapContainer>
                        <GoogleMapReact
                            bootstrapURLKeys={{key: process.env.REACT_APP_GOOGLE_MAP_KEY}}
                            defaultCenter={this.props.center}
                            defaultZoom={this.props.zoom}
                            // onGoogleApiLoaded={({map, maps}) => this.renderPolylines(map, maps)}
                        >
                            {this.state.drones.map((drone) =>
                                <Drone
                                    {...drone}
                                    key={drone.teamId}
                                    lat={drone.latitude}
                                    lng={drone.longitude}
                                />
                            )}
                            {this.state.parcels.map((parcel, index) => [
                                    <Parcel
                                        key={`parcel-${parcel.teamId}-${index}`}
                                        lat={get(parcel, 'location.pickup.latitude')}
                                        lng={get(parcel, 'location.pickup.longitude')}
                                        {...parcel}
                                    />,
                                    <Pin
                                        key={`delivery-pin-${parcel.teamId}-${index}`}
                                        lat={get(parcel, 'location.delivery.latitude')}
                                        lng={get(parcel, 'location.delivery.longitude')}
                                        {...parcel}
                                    />
                                ]
                            )}
                            {this.props.showBoundaries ? this.renderBoundaries() : null}
                        </GoogleMapReact>
                    </GoogleMapContainer>
                    <ScoresContainer>
                        {parseScores(this.state.drones).map((drone, index) => (
                            <Score {...drone} />
                        ))}
                    </ScoresContainer>
                </Section>
                {/*
                <Actions>
                  <button onClick={this.stopDrone}>Stop</button>
                  <button onClick={this.startDrone}>Start</button>
                </Actions>
                */}
            </AppContainer>
        );
    }
}

export default App;
