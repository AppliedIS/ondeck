import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import Slider from 'material-ui/Slider';

import { updateSettings } from '../state/actions/settingsActions';

class GeoJsonSettings extends Component {
    constructor(props, context) {
        super(props, context);

        this._handleOnChange = this._handleOnChange.bind(this);
    }

    _handleOnChange(key, value) {
        let newSettings = Object.assign({}, this.props.settings);
        newSettings[key] = value;
        this.props.updateSettings(newSettings);
    }

    render() {
        if (this.props.data) {
            const featurePropOptions = [
                <MenuItem value={null} key="none" primaryText=""/>
            ];
            if (this.props.data.features && this.props.data.features.length > 0) {
                const featureProps = _.keys(this.props.data.features[0].properties);
                _.forEach(featureProps, prop => {
                    featurePropOptions.push(<MenuItem value={prop} key={prop} primaryText={prop}/>);
                });
            }
            const sliderStyle = {
                marginTop: 0,
                marginBottom: 0
            };
            const helpActions = [
                <FlatButton label="Close" secondary={true} onClick={this.props.onCloseHelp}/>
            ];

            return (
                <div>
                    <h3>GeoJson Settings</h3>
                    <SelectField floatingLabelText="Tooltip Properties" floatingLabelFixed={true} hintText="Select..."
                                 className="settings__select" value={this.props.settings.tooltipProps}
                                 multiple={true} onChange={(event, index, value) => {
                        this._handleOnChange('tooltipProps', value);
                    }}>
                        {_.drop(featurePropOptions)}
                    </SelectField>
                    <SelectField floatingLabelText="Elevation Property" floatingLabelFixed={true} hintText="Select..."
                                 className="settings__select" value={this.props.settings.elevationProp}
                                 onChange={(event, index, value) => {
                                     this._handleOnChange('elevationProp', value);
                                 }}>
                        {featurePropOptions}
                    </SelectField>
                    <SelectField floatingLabelText="Fill Color Property" floatingLabelFixed={true} hintText="Select..."
                                 className="settings__select" value={this.props.settings.fillProp}
                                 onChange={(event, index, value) => {
                                     this._handleOnChange('fillProp', value);
                                 }}>
                        {featurePropOptions}
                    </SelectField>
                    <SelectField floatingLabelText="Line Color Property" floatingLabelFixed={true} hintText="Select..."
                                 className="settings__select" value={this.props.settings.lineProp}
                                 onChange={(event, index, value) => {
                                     this._handleOnChange('lineProp', value);
                                 }}>
                        {featurePropOptions}
                    </SelectField>
                    <Toggle className="settings__toggle" label="Filled" toggled={this.props.settings.filled}
                            onToggle={(event, isInputChecked) => {
                                this._handleOnChange('filled', isInputChecked);
                            }}/>
                    <Toggle className="settings__toggle" label="Stroked" toggled={this.props.settings.stroked}
                            onToggle={(event, isInputChecked) => {
                                this._handleOnChange('stroked', isInputChecked);
                            }}/>
                    <Toggle className="settings__toggle" label="Extruded" toggled={this.props.settings.extruded}
                            onToggle={(event, isInputChecked) => {
                                this._handleOnChange('extruded', isInputChecked);
                            }}/>
                    <Toggle className="settings__toggle" label="Wireframe" toggled={this.props.settings.wireframe}
                            onToggle={(event, isInputChecked) => {
                                this._handleOnChange('wireframe', isInputChecked);
                            }}/>
                    <div className="settings__slider">
                        <label>Min Point Radius</label>
                        <Slider min={1} max={20} step={1} sliderStyle={sliderStyle}
                                value={this.props.settings.pointRadiusMinPixels}
                                onChange={_.debounce((event, value) => {
                                    this._handleOnChange('pointRadiusMinPixels', value);
                                }, 250)}/>
                    </div>
                    <div className="settings__slider">
                        <label>Point Radius Scale</label>
                        <Slider min={0} max={1000} step={1} sliderStyle={sliderStyle}
                                value={this.props.settings.pointRadiusScale}
                                onChange={_.debounce((event, value) => {
                                    this._handleOnChange('pointRadiusScale', value);
                                }, 250)}/>
                    </div>
                    <div className="settings__slider">
                        <label>Min Line Width</label>
                        <Slider min={1} max={20} step={1} sliderStyle={sliderStyle}
                                value={this.props.settings.lineWidthMinPixels}
                                onChange={_.debounce((event, value) => {
                                    this._handleOnChange('lineWidthMinPixels', value);
                                }, 250)}/>
                    </div>
                    <Dialog title='GeoJson Settings' modal={false} open={this.props.showHelp} onRequestClose={this.props.onCloseHelp}
                            actions={helpActions} autoScrollBodyContent={true} className="settings__help">
                        <dl>
                            <dt>FP64</dt>
                            <dd>Whether the layer should be rendered in high-precision 64-bit mode</dd>
                            <dt>Tooltip Properties</dt>
                            <dd>The properties (in addition to longitude and latitude) that will show in the tooltip when hovering over a
                                feature.
                            </dd>
                            <dt>Elevation Property</dt>
                            <dd>The property that controls the elevation of a polygon feature (when extruded is true).</dd>
                            <dt>Fill Color Property</dt>
                            <dd>The property that controls the solid color of polygon and point features.</dd>
                            <dt>Line Color Property</dt>
                            <dd>The property that controls the color of a line and/or the outline of polygon.</dd>
                            <dt>Filled</dt>
                            <dd>Whether to draw filled polygons (solid fill). Note that for each polygon, only the area between the outer
                                polygon and any holes will be filled. This setting is effective only when the polygon is NOT extruded.
                            </dd>
                            <dt>Stroked</dt>
                            <dd>Whether to draw an outline around polygons (solid fill). Note that for complex polygons, both the outer
                                polygon as well the outlines of any holes will be drawn.
                            </dd>
                            <dt>Extruded</dt>
                            <dd>Extrude Polygon and MultiPolygon features along the z-axis if set to true.</dd>
                            <dt>Wireframe</dt>
                            <dd>Whether to generate a line wireframe of the hexagon. The outline will have "horizontal" lines closing the
                                top
                                and bottom polygons and a vertical line (a "strut") for each vertex on the polygon.
                            </dd>
                            <dt>Minimum Point Radius</dt>
                            <dd>The minimum radius in pixels.</dd>
                            <dt>Point Radius Scale</dt>
                            <dd>A global radius multiplier for all points.</dd>
                            <dt>Minimum Line Width</dt>
                            <dd>The minimum line width in pixels.</dd>
                        </dl>
                    </Dialog>
                </div>
            );
        }
        return false;
    }
}

GeoJsonSettings.propTypes = {
    config: PropTypes.object,
    settings: PropTypes.object,
    data: PropTypes.object
};

const mapStateToProps = state => {
    return {
        config: state.config,
        settings: state.settings,
        data: state.data
    };
};

export default connect(mapStateToProps, {
    updateSettings
})(GeoJsonSettings);
