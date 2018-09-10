import React, {Component} from 'react';
import styled from 'styled-components';
import {get} from 'lodash';
import uuid from 'uuid';
import {
    along,
    bbox,
    coordAll,
    getCoord,
    buffer,
    point,
    randomPoint,
    featureCollection,
    polygonToLine,
    pointOnFeature,
} from '@turf/turf';

import {
    GAME_PARAMETERS,
    TEAMS,
    STATUS,
} from '../../constants';
import {COLORS} from '../../styles/variables';
import {
    getRandomFloat,
    getRandomInteger,
    parseDroneTeamColor,
    postDroneInfo,
    postParcel,
} from '../../services/drone.service';

const AdminContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
`;

const FormsContainer = styled(AdminContainer)`
  width: 100%;
  flex-flow: row nowrap;
  align-items: flex-start;
`;

const Input = styled.input`
  height: 20px;
  border: #333333 1px dotted;
  border-radius: 3px;
`;

const Select = styled.select`
  height: 20px;
  border: #333333 1px dotted;
  padding: 10px;
`;

const Button = styled.button`
  height: 30px;
  min-width: 100px;
  border: #333333 1px solid;
`;

const Line = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1 1 auto;
  width: 100%;
  padding: 10px;
  h3 {
    margin: 0;
    padding: 0;
  }
`;

const ResultLine = styled(Line)`
  display: flex;
  flex: 1 1 auto;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: center;
  max-height: 150px;
`;

const Form = styled.div`
  display: flex;
  flex: 0 1 70%;
  flex-flow: column;
  align-items: center;
  padding: 20px;
  margin-left: 10px;
  margin-right: 10px;
  border: #333333 1px solid;
`;

const Team = styled.div`
  display: flex;
  flex: 0 1 auto;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
  color: #fff;
  height: 30px;
  width: 100px;
  border-radius: 10px;
  background: ${(props) => COLORS[parseDroneTeamColor(props.teamId)]};
  padding: 5px;
  margin-bottom: 5px;
`;

export class Admin extends Component {
    static defaultProps = {
        ...GAME_PARAMETERS,
    };

    constructor() {
        super();
        this.state = {
            numberOfTeams: 3,
            // savedTeams: [],
            savedTeams: [
                {
                    "teamId": "blue-622",
                    "location": {
                        "latitude": 48.83503446744604,
                        "longitude": 2.36116207743742
                    },
                    "parcels": [],
                    "score": 0
                },
                {
                    "teamId": "red-647",
                    "location": {
                        "latitude": 48.88089191757057,
                        "longitude": 2.360009874973255
                    },
                    "parcels": [],
                    "score": 0
                },
                {
                    "teamId": "green-876",
                    "location": {
                        "latitude": 48.84003457564094,
                        "longitude": 2.3170768545494402
                    },
                    "parcels": [],
                    "score": 0
                },
                {
                    "teamId": "orange-471",
                    "location": {
                        "latitude": 48.83988817014468,
                        "longitude": 2.315606566387995
                    },
                    "parcels": [],
                    "score": 0
                },
                {
                    "teamId": "purple-339",
                    "location": {
                        "latitude": 48.87984385267196,
                        "longitude": 2.355004483481937
                    },
                    "parcels": [],
                    "score": 0
                },
                {
                    "teamId": "black-667",
                    "location": {
                        "latitude": 48.865904849256,
                        "longitude": 2.353661017140987
                    },
                    "parcels": [],
                    "score": 0
                },
                {
                    "teamId": "grey-642",
                    "location": {
                        "latitude": 48.87870635390388,
                        "longitude": 2.343786525898337
                    },
                    "parcels": [],
                    "score": 0
                }
            ],
            targetTeam: '',
            savedParcels: [],
        };
        this.startingBBox = {};
        this.startingPoints = [];
        this.parcelsBBox = {};
        this.numberOfParcels = 0;
    }

    handleFormChange = (inputId, event) => {
        event.preventDefault();
        this.setState({
            [inputId]: event.target.value,
        });
    };

    // admin teams
    setStartingBBox() {
        const center = point([this.props.center.lat, this.props.center.lng]);
        const distance = this.props.startingAreaDistance || 3;
        const options = {steps: 10, units: 'kilometers'};
        const startingBuffer = buffer(center, distance, options);
        this.startingBBox = bbox(startingBuffer);
    }

    setTeamStartingPoints() {
        this.setStartingBBox();
        this.startingPoints = coordAll(randomPoint(this.state.numberOfTeams, {bbox: this.startingBBox}));
    }

    generateTeamId() {
        return getRandomInteger(1, 999);
    }

    async createTeams () {
        this.setTeamStartingPoints();
        let usedIds = [];
        const teamsIterate = Array.from(Array(parseInt(this.state.numberOfTeams, 10)));
        const teams = teamsIterate.map((value, index) => {
            let id;
            let goodId = null;
            const teamColor = TEAMS[index];
            while (!goodId) {
                id = this.generateTeamId();
                goodId = usedIds.some(usedId => usedId === id) ? null : id;
            }
            usedIds = [
                ...usedIds,
                goodId,
            ];
            const lat = this.startingPoints[index][0] || this.props.center.lat;
            const lng = this.startingPoints[index][1] || this.props.center.lng;
            if (this.state.numberOfTeams >= usedIds.length) {
                return {
                    teamId: `${teamColor}-${id}`,
                    location: {
                        latitude: lat,
                        longitude: lng,
                    },
                    parcels: [],
                    score: 0,
                }
            }
        });
        console.log('teams', teams);
        const savedTeams = await postDroneInfo(teams);
        this.setState({
            savedTeams,
        }, console.log('savedTeams',savedTeams));
    }

    submitInitTeams = (event) => {
        event.preventDefault();
        this.createTeams();
    };

    // Other generating method for drones POC
    // this.startingLine = polygonToLine(startingBuffer);
    // const teamsIterate = Array.from(Array(parseInt(this.state.numberOfTeams, 10)));
    // this.startingPoints = teamsIterate.map(() => {
    //     // return pointOnFeature(this.startingLine);
    //     return getCoord(along(this.startingLine, getRandomFloat(1,4), {units: 'kilometers'}));
    // });
    
    // admin parcels other POC
    // setParcelsBBox() {
    //     const boundariesPoints = this.props.pinBoundaries.map(boundary => {
    //         return [boundary.latitude, boundary.longitude];
    //     });
    //     const bboxBoundaries = featureCollection(boundariesPoints);
    //     console.log(bboxBoundaries);
    // }
    //
    // setParcelsCoordinates() {
    //     this.setParcelsBBox();
    //     this.numberOfParcels = this.state.generateParcelForTeam === 'all' ? this.state.savedTeams.length : 1;
    //     this.parcelsPoints = coordAll(randomPoint(this.numberOfParcels, {bbox: this.startingBBox}));
    //     console.log(this.parcelsPoints)
    // }

    // admin parcels
    async createParcels() {
        // this.setParcelsCoordinates();
        this.numberOfParcels = this.state.targetTeam === 'all' ? this.state.savedTeams.length : 1;
        console.log(this.numberOfParcels)
        const parcelsIterate = Array.from(Array(this.numberOfParcels || 1));
        const parcels = parcelsIterate.map((value, index) => {
            // const lat = this.parcelsPoints[index][0] || this.props.center.lat;
            // const lng = this.parcelsPoints[index][1] || this.props.center.lng;
            return {
                parcelId: uuid.v4(),
                teamId: this.numberOfParcels === 1 ? this.state.targetTeam : this.state.savedTeams[index],
                score: 100,
                status: STATUS.AVAILABLE,
                pickup: {
                    latitude: getRandomFloat(GAME_PARAMETERS.boundaries.minLatitude, GAME_PARAMETERS.boundaries.maxLatitude),
                    longitude: getRandomFloat(GAME_PARAMETERS.boundaries.minLongitude, GAME_PARAMETERS.boundaries.maxLongitude),
                },
            };
        });
        console.log('createParcels', parcels);
        const savedParcels = await postParcel(parcels);
        this.setState({
            savedParcels,
        }, console.log('savedParcels',savedParcels));

    }

    submitInitParcels = (event) => {
        event.preventDefault();
        this.createParcels();
    };

    renderTeams() {
        return (
            this.state.savedTeams &&
            this.state.savedTeams.length > 0 &&
            this.state.savedTeams.map(team => (
                <Team
                    key={team.teamId}
                    {...team}
                >
                    {team.teamId}
                </Team>
            ))
        );
    }

    renderTeamsList() {
        return (
            this.state.savedTeams &&
            this.state.savedTeams.length > 0 &&
            this.state.savedTeams.map(team => (
                <option 
                    key={`option-${team.teamId}`}
                >
                    {team.teamId}
                </option>
            ))
        );
    }

    renderParcels() {
        // TODO
    }

    // TODO Clear data store
    // TODO Get data from data store (if page is reloaded)
    render() {
        return (
            <AdminContainer>
                <h1>Admin</h1>
                <FormsContainer>
                    <Form id="initTeams">
                        <Line>
                            <h3>Init teams</h3>
                        </Line>
                        <Line>
                            <label>
                                Number of teams:{' '}
                                <Input
                                    id="numberOfTeams"
                                    type="number"
                                    min="3" max="10"
                                    value={this.state.numberOfTeams}
                                    onChange={this.handleFormChange.bind(this, 'numberOfTeams')}
                                />
                            </label>
                        </Line>
                        <Line>
                            <Button type="button" onClick={this.submitInitTeams}>
                                Save
                            </Button>
                        </Line>
                        <ResultLine>
                            {this.renderTeams()}
                        </ResultLine>
                    </Form>
                    <Form id="initParcels">
                        <Line>
                            <h3>Init parcels</h3>
                        </Line>
                        <Line>
                            <label>
                                Generate Parcels for:{' '}
                                <Select
                                    id="targetTeam"
                                    value={this.state.targetTeam}
                                    onChange={this.handleFormChange.bind(this, 'targetTeam')}
                                >
                                    <option value="all">all</option>
                                    {this.renderTeamsList()}
                                </Select>
                            </label>
                        </Line>
                        <Line>
                            <Button type="button" onClick={this.submitInitParcels}>
                                Generate parcels
                            </Button>
                        </Line>
                        <ResultLine>
                            {this.renderParcels()}
                        </ResultLine>
                    </Form>
                </FormsContainer>
            </AdminContainer>
        )
    }
}

export default Admin;