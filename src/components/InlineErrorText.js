import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import styles from '@styles/styles';
import Text from './Text';

const propTypes = {
    /** Text to display */
    children: PropTypes.string.isRequired,

    /** Styling for inline error text */
    // eslint-disable-next-line react/forbid-prop-types
    styles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    styles: [],
};

function InlineErrorText(props) {
    if (_.isEmpty(props.children)) {
        return null;
    }

    return <Text style={[...props.styles, styles.formError, styles.mt1]}>{props.children}</Text>;
}

InlineErrorText.propTypes = propTypes;
InlineErrorText.defaultProps = defaultProps;
InlineErrorText.displayName = 'InlineErrorText';
export default InlineErrorText;
