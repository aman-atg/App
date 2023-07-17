import React, {useState} from 'react';
import {Text, View, ScrollView} from 'react-native';
import PropTypes from "prop-types";
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import Section from '../../../../../components/Section';
import * as Illustrations from '../../../../../components/Icon/Illustrations';
import * as Expensicons from '../../../../../components/Icon/Expensicons';
import themeColors from '../../../../../styles/themes/default';
import styles from '../../../../../styles/styles';
import ConfirmModal from '../../../../../components/ConfirmModal';
import * as Session from "../../../../../libs/actions/Session";
import StepWrapper from "../StepWrapper/StepWrapper";
import CONST from "../../../../../CONST";

const propTypes = {
    ...withLocalizePropTypes,

    /** Method to set the next step */
    setStep: PropTypes.func.isRequired,
}

function IsEnabledStep({translate, setStep}) {
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
        >
            <ScrollView>
                <Section
                    title={translate('twoFactorAuth.twoFactorAuthEnabled')}
                    icon={Illustrations.ShieldYellow}
                    menuItems={[
                        {
                            title: translate('twoFactorAuth.disableTwoFactorAuth'),
                            onPress: () => {
                                setIsConfirmModalVisible(true);
                            },
                            icon: Expensicons.Close,
                            iconFill: themeColors.danger,
                            wrapperStyle: [styles.cardMenuItem],
                        },
                    ]}
                    containerStyles={[styles.twoFactorAuthSection]}
                >
                    <View style={styles.mv3}>
                        <Text style={styles.textLabel}>{translate('twoFactorAuth.whatIsTwoFactorAuth')}</Text>
                    </View>
                </Section>
                <ConfirmModal
                    title={translate('twoFactorAuth.disableTwoFactorAuth')}
                    onConfirm={() => {
                        setIsConfirmModalVisible(false);
                        setStep(CONST.TWO_FACTOR_AUTH_STEPS.DISABLE);
                        Session.toggleTwoFactorAuth(false);
                    }}
                    onCancel={() => setIsConfirmModalVisible(false)}
                    onModalHide={() => setIsConfirmModalVisible(false)}
                    isVisible={isConfirmModalVisible}
                    prompt={translate('twoFactorAuth.disableTwoFactorAuthConfirmation')}
                    confirmText={translate('twoFactorAuth.disable')}
                    cancelText={translate('common.cancel')}
                    shouldShowCancelButton
                    danger
                />
            </ScrollView>
        </StepWrapper>
    );
}

IsEnabledStep.propTypes = propTypes;
IsEnabledStep.defaultProps = {};

export default withLocalize(IsEnabledStep);
