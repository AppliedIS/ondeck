import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import * as _ from 'lodash';

import SelectField from 'material-ui/SelectField';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import ActionHelp from 'material-ui/svg-icons/action/help';
import ActionCached from 'material-ui/svg-icons/action/cached';
import ContentSave from 'material-ui/svg-icons/content/save';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import RefreshIndicator from 'material-ui/RefreshIndicator';

import { updateConfig, saveConfig, resetConfig } from '../state/actions/configActions';
import { updateSettings, resetSettings } from '../state/actions/settingsActions';
import { fetchData } from '../state/actions/dataActions';
import GeoJsonSettings from './geojson.settings.component';
import HexagonSettings from './hexagon.settings.component';
import StatusToast from '../toast/StatusToast';

import 'react-toastify/dist/ReactToastify.min.css';
import './component.css';

class SettingsComponent extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            drawerOpen: false,
            showHelp: false,
            dataUrl: this.props.config.dataUrl,
            pending: false
        };

        this._handleDrawerOpen = this._handleDrawerOpen.bind(this);
        this._handleDrawerClose = this._handleDrawerClose.bind(this);
        this._handleHelpOpen = this._handleHelpOpen.bind(this);
        this._handleHelpClose = this._handleHelpClose.bind(this);
        this._saveConfig = this._saveConfig.bind(this);
        this._resetConfig = this._resetConfig.bind(this);
        this._handleDataSource = this._handleDataSource.bind(this);
        this._handleDataSourceUpdate = this._handleDataSourceUpdate.bind(this);
        this._handleDataSourceKeyDown = this._handleDataSourceKeyDown.bind(this);
        this._handleLayer = this._handleLayer.bind(this);
        this._handleBaseMap = this._handleBaseMap.bind(this);

        this.props.fetchData(this.props.config.dataUrl);
    }

    toastId = null;

    _handleDrawerOpen() {
        this.setState({ drawerOpen: true });
    }

    _handleDrawerClose() {
        this.setState({ drawerOpen: false });
    }

    _handleHelpOpen() {
        this.setState({ showHelp: true });
    }

    _handleHelpClose() {
        this.setState({ showHelp: false });
    }

    _saveConfig() {
        let newConfig = _.cloneDeep(this.props.config);
        newConfig.layers[newConfig.layer].settings = this.props.settings;
        newConfig.viewport = this.props.viewport;
        this.props.saveConfig(newConfig);
        if (!toast.isActive(this.toastId)) {
            this.toastId = toast(<StatusToast title="Application state saved."/>, {
                type: toast.TYPE.SUCCESS
            });
        }
    }

    _resetConfig() {
        this.props.resetConfig();
        this.props.resetSettings();
        if (!toast.isActive(this.toastId)) {
            this.toastId = toast(<StatusToast title="Application state reset."/>, {
                type: toast.TYPE.SUCCESS
            });
        }
    }

    _handleDataSource(event) {
        this.setState({
            dataUrl: event.target.value
        });
    }

    _handleDataSourceUpdate() {
        let newConfig = Object.assign({}, this.props.config);
        let newSettings = Object.assign({}, this.props.settings);
        if (this.state.dataUrl !== this.props.config.dataUrl) {
            newConfig.dataUrl = this.state.dataUrl;
            newSettings.tooltipProps = [];
            this.props.fetchData(newConfig.dataUrl);
            this.props.updateConfig(newConfig);
            this.props.updateSettings(newSettings);
        }
    }

    _handleDataSourceKeyDown(event) {
        if (event.keyCode === 13) {
            this._handleDataSourceUpdate();
        }
    }

    _handleLayer(event, index, value) {
        let newConfig = Object.assign({}, this.props.config);
        newConfig.layer = value;
        this.props.updateConfig(newConfig);
    }

    _handleBaseMap(event, index, value) {
        let newConfig = _.cloneDeep(this.props.config);
        newConfig.baseMap = value;
        this.props.updateConfig(newConfig);
    }

    componentWillReceiveProps(nextProps) {
        // check for new data url
        if (this.props.config.dataUrl !== nextProps.config.dataUrl) {
            this.setState({
                dataUrl: nextProps.config.dataUrl,
            });
            nextProps.fetchData(nextProps.config.dataUrl);
        }
        // check for new layer type
        if (this.props.config.layer !== nextProps.config.layer) {
            nextProps.updateSettings(nextProps.config.layers[nextProps.config.layer].settings);
        }
        // check for fetch status
        if (nextProps.data) {
            this.setState({
                pending: nextProps.data.pending
            });
            if (nextProps.data.error) {
                console.log(nextProps.data.error);
                toast(<StatusToast title="Data Error" message={nextProps.data.error.toString()}/>, {
                    type: toast.TYPE.ERROR
                });
            }
        }
    }

    render() {
        const layers = _.values(this.props.config.layers);
        const layerOptions = [];
        _.forEach(layers, layer => {
            layerOptions.push(<MenuItem value={layer.value} key={layer.value} primaryText={layer.label}/>);
        });
        const baseMaps = _.values(this.props.config.baseMaps);
        const baseMapOptions = [];
        _.forEach(baseMaps, baseMap => {
            baseMapOptions.push(<MenuItem value={baseMap.url} key={baseMap.url} primaryText={baseMap.name}/>);
        });
        const refreshStatus = this.state.pending ? 'loading' : 'ready';

        let settingsComponent = null;
        switch(this.props.config.layer) {
            case 'geojson':
                settingsComponent = <GeoJsonSettings showHelp={this.state.showHelp} onCloseHelp={this._handleHelpClose}/>;
                break;
            case 'hexagon':
                settingsComponent = <HexagonSettings showHelp={this.state.showHelp} onCloseHelp={this._handleHelpClose}/>;
                break;
            default:
                break;
        }

        return(
            <div className="settings">
                <FloatingActionButton mini className="settings__open-btn" onClick={this._handleDrawerOpen}>
                    <NavigationMenu/>
                </FloatingActionButton>
                <Drawer open={this.state.drawerOpen} width="25%">
                    <div className="settings__drawer">
                        <div className="settings__actions">
                            <div>
                                <FloatingActionButton mini secondary className="settings__close-btn" onClick={this._handleDrawerClose}>
                                    <NavigationChevronLeft/>
                                </FloatingActionButton>
                            </div>
                            <h1>OnDeck</h1>
                            <IconMenu iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                      anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                                      targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                      className="settings__menu">
                                <MenuItem leftIcon={<ContentSave/>} primaryText="Save" onClick={this._saveConfig}/>
                                <MenuItem leftIcon={<ActionCached/>} primaryText="Reset" onClick={this._resetConfig}/>
                                <Divider/>
                                <MenuItem leftIcon={<ActionHelp/>} primaryText="Help" onClick={this._handleHelpOpen}/>
                            </IconMenu>
                        </div>
                        <div className="settings__drawer-content">
                            <div className="settings__data-source">
                                <TextField floatingLabelText="Data Source" value={this.state.dataUrl} onChange={this._handleDataSource}
                                           className="settings__data-source-input" onKeyDown={this._handleDataSourceKeyDown}/>
                                <IconButton onClick={this._handleDataSourceUpdate} tooltip="Refresh Data Source" tooltipPosition="top-left"
                                            className="settings__data-source-refresh">
                                    <RefreshIndicator size={30} left={8} top={8} percentage={80} color="#2196f3" status={refreshStatus}/>
                                </IconButton>
                            </div>
                            <SelectField floatingLabelText="Base Map" floatingLabelFixed={true} hintText="Select..."
                                         className="settings__select" value={this.props.config.baseMap}
                                         onChange={this._handleBaseMap}>
                                {baseMapOptions}
                            </SelectField>
                            <SelectField floatingLabelText="Layer" floatingLabelFixed={true} hintText="Select..."
                                         className="settings__select" value={this.props.config.layer}
                                         onChange={this._handleLayer}>
                                {layerOptions}
                            </SelectField>
                            {settingsComponent}
                        </div>
                    </div>
                </Drawer>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    pauseOnHover
                />
            </div>
        );
    }
}

SettingsComponent.propTypes = {
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
    updateConfig,
    updateSettings,
    resetSettings,
    saveConfig,
    resetConfig,
    fetchData
})(SettingsComponent);
