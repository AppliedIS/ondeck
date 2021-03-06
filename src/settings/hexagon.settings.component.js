import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import Slider from 'material-ui/Slider';

import { updateSettings } from '../state/actions/settingsActions';

class HexagonSettings extends Component {
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
            const sliderStyle = {
                marginTop: 0,
                marginBottom: 0
            };
            const helpActions = [
                <FlatButton label="Close" secondary={true} onClick={this.props.onCloseHelp}/>
            ];

            return(
                <div>
                    <h3>Hexagon Settings</h3>
                    <Toggle className="settings__toggle" label="Extruded" toggled={this.props.settings.extruded}
                            onToggle={(event, isInputChecked) => {
                                this._handleOnChange('extruded', isInputChecked);
                            }}/>
                    <div className="settings__slider">
                        <label>Radius</label>
                        <Slider min={10} max={10000} step={10} sliderStyle={sliderStyle}
                                value={this.props.settings.radius}
                                onChange={_.debounce((event, value) => {
                                    this._handleOnChange('radius', value);
                                }, 250)}/>
                    </div>
                    <div className="settings__slider">
                        <label>Coverage</label>
                        <Slider min={0} max={1} step={0.1} sliderStyle={sliderStyle}
                                value={this.props.settings.coverage}
                                onChange={_.debounce((event, value) => {
                                    this._handleOnChange('coverage', value);
                                }, 250)}/>
                    </div>
                    <div className="settings__slider">
                        <label>Lower Percentile</label>
                        <Slider min={0} max={100} step={1} sliderStyle={sliderStyle}
                                value={this.props.settings.lowerPercentile}
                                onChange={_.debounce((event, value) => {
                                    this._handleOnChange('lowerPercentile', value);
                                }, 250)}/>
                    </div>
                    <div className="settings__slider">
                        <label>Upper Percentile</label>
                        <Slider min={0} max={100} step={1} sliderStyle={sliderStyle}
                                value={this.props.settings.upperPercentile}
                                onChange={_.debounce((event, value) => {
                                    this._handleOnChange('upperPercentile', value);
                                }, 250)}/>
                    </div>
                    <div className="settings__slider">
                        <label>Lower Elevation</label>
                        <Slider min={0} max={100000} step={1000} sliderStyle={sliderStyle}
                                value={this.props.settings.lowerElevation}
                                onChange={_.debounce((event, value) => {
                                    this._handleOnChange('lowerElevation', value);
                                }, 250)}/>
                    </div>
                    <div className="settings__slider">
                        <label>Upper Elevation</label>
                        <Slider min={0} max={100000} step={1000} sliderStyle={sliderStyle}
                                value={this.props.settings.upperElevation}
                                onChange={_.debounce((event, value) => {
                                    this._handleOnChange('upperElevation', value);
                                }, 250)}/>
                    </div>
                    <Dialog title='Hexagon Settings' modal={false} open={this.props.showHelp} onRequestClose={this.props.onCloseHelp}
                            actions={helpActions} autoScrollBodyContent={true} className="settings__help">
                        <dl>
                            <dt>FP64</dt>
                            <dd>Whether the layer should be rendered in high-precision 64-bit mode</dd>
                            <dt>Extruded</dt>
                            <dd>Whether to enable cell elevation. Cell elevation scale by count of points in each cell. If set to false, all
                                cells will be flat.</dd>
                            <dt>Radius</dt>
                            <dd>Radius of hexagon bin in meters.</dd>
                            <dt>Coverage</dt>
                            <dd>Hexagon radius multiplier. The final radius of a hexagon is calculated by coverage * radius. Note: coverage
                                does not affect how points are binned. The radius of the bin is determined only by the radius property.</dd>
                            <dt>Lower/Upper Percentile</dt>
                            <dd>Filter bins and re-calculate color by percentile value. Hexagons with value larger than the upper percentile
                                will be hidden, along with hexagons with value smaller than the lower percentile.</dd>
                            <dt>Lower/Upper Elevation</dt>
                            <dd>Controls the minimum and maximum elevation of hexagons.</dd>
                        </dl>
                    </Dialog>
                </div>
            );
        }
    }
}

HexagonSettings.propTypes = {
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
})(HexagonSettings);
