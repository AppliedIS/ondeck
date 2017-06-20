import React from 'react';
import PropTypes from 'prop-types';


const AisNumberInput = ({name, label, step=1, error, onChange, value}) => {

    return (
        <div className="AisNumberInput">
            <label className="AisNumberInput__label" htmlFor={name}>{label}</label>
            <input className="AisNumberInput__input"
                type="number"
                name={name}
                onChange={onChange}
                step={step}
                value={value}
                />
            { error && <div className="error">{error}</div> }
        </div>
    );
};

AisNumberInput.propTypes = {
    error: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    step: PropTypes.number,
    value: PropTypes.number,
    onChange: PropTypes.func
};

export default AisNumberInput;
