import React from 'react';
import PropTypes from 'prop-types';
import MapGL from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import Measure from 'react-measure';
import 'whatwg-fetch';
import { ToastContainer, ToastMessage } from 'react-toastr'; 

import initialViewport from './initialViewport';
import MapStyles from './MapStyles';
import ODHexagonLayer from './ODHexagonLayer';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYm93bWFubWMiLCJhIjoieE9WenlhayJ9.QFS8jQtCusMhwwVSMQIg9w';
const ToastMessageFactory = React.createFactory(ToastMessage.animation);


class MapComponent extends React.Component {

    constructor(props) {
        super(props);

        let vp = Object.assign({}, initialViewport, {
            bearing: props.configuration.bearing,
            pitch: props.configuration.pitch
        });

        this.state = {
            viewport: vp,
            bounds: null,
            width: 0,
            height: 0
        };

        this.onChangeViewport = this.onChangeViewport.bind(this);
        this.onResize = this.onResize.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.showToastr = this.showToastr.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.configuration.dataUrl !== nextProps.configuration.dataUrl) {
            this.fetchData(nextProps.configuration.dataUrl);
        }

        let vp = Object.assign({}, this.state.viewport, {
            bearing: nextProps.configuration.bearing,
            pitch: nextProps.configuration.pitch
        });
        this.setState({
            viewport: vp
        });
    }

    componentDidUpdate() {
        // null out the center so the user can pan/zoom around on the map
        if (this.state.center) {
            this.setState({
                center: null
            });
        }
    }

    showToastr(alertType, title, message) {
        this.refs.container[alertType](message, title, {
            closeButton: true,
        });
    }

    fetchData(url) {
        const dataUrl = url || this.props.configuration.dataUrl;
        fetch(dataUrl).then(response => {
            return response.json();
        }).then(data => {
            // need data in format: [[lng, lat], [lng, lat],...]
            let bounds = null;
            const pts = [];
            data.features.forEach(feature => {
                let coords = feature.geometry.coordinates;
                pts.push(coords);
                if (bounds) {
                    bounds.extend(coords);
                }
                else {
                    bounds = new mapboxgl.LngLatBounds(coords, coords);
                }
            });
            //console.log('Points: ' + JSON.stringify(pts));
            //console.log('Bounds: ' + JSON.stringify(bounds));
            // Calculate center of bounds by taking the average
            const center = {
                latitude: ((bounds._sw.lat + bounds._ne.lat) / 2),
                longitude: ((bounds._ne.lng + bounds._sw.lng) / 2)
            };
            this.setState({
                center: center,
                data: pts
            });
        }).catch(error => {
            console.error('Error getting data from ' + dataUrl, error);
            this.setState({
                center: {
                    latitude: 0,
                    longitude: 0
                },
                data: null
            });
            this.showToastr('error', 'Data Error', `Error fetching data from "${dataUrl}"`);
        });
    }

    onChangeViewport(newViewport) {
        this.setState({
            viewport: newViewport
        });
    }

    onResize(dimensions) {
        this.setState({
            width: dimensions.width,
            height: dimensions.height
        });
    }

    render() {
        //console.log('Rendering MapComponent...');
        const config = this.props.configuration;
        const mapStyles = new MapStyles();

        const {data, viewport, center, width, height} = this.state;
        // GeoJSON layer
        // const layerOpts = Object.assign(mapStyles.getDataStyling(config), {data});
        // const layer = new GeoJsonLayer(layerOpts);
        //console.log('rendering map with state: ' + JSON.stringify(this.state));

        if (center) {
            //console.log('Centering map at ' + JSON.stringify(center));
            viewport.latitude = center.latitude;
            viewport.longitude = center.longitude;
        }

        const mapStyling = mapStyles.getMapStyling(config);
        const colorRange = config.availableColorRanges[config.colorRange];

        return (
            <span>
                <ToastContainer ref="container"
                    toastMessageFactory={ToastMessageFactory}
                    className="toast-top-right" />
                <Measure onMeasure={this.onResize}>
                    <div className="Map">
                        <MapGL
                            {...viewport}
                            width={width}
                            height={height}
                            onChangeViewport={this.onChangeViewport}
                            mapStyle={mapStyling}
                            perspectiveEnabled={true}
                            mapboxApiAccessToken={MAPBOX_TOKEN}>
                            <ODHexagonLayer
                                viewport={viewport}
                                width={width}
                                height={height}
                                colorRange={colorRange}
                                radius={config.radius}
                                coverage={config.coverage}
                                lowerPercentile={config.lowerPercentile}
                                upperPercentile={config.upperPercentile}
                                data={data || []}
                            />
                        </MapGL>
                    </div>
                </Measure>
            </span>
        );
    }
}

MapComponent.propTypes = {
    configuration: PropTypes.object.isRequired
};

export default MapComponent;
