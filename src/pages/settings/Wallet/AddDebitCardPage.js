import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import AddressSearch from '@components/AddressSearch';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import StatePicker from '@components/StatePicker';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import * as ValidationUtils from '@libs/ValidationUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import styles from '@styles/styles';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /* Onyx Props */
    formData: PropTypes.shape({
        setupComplete: PropTypes.bool,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    formData: {
        setupComplete: false,
    },
    betas: [],
};

function DebitCardPage(props) {
    const {translate} = useLocalize();
    const prevFormDataSetupComplete = usePrevious(props.formData.setupComplete);
    const nameOnCardRef = useRef(null);

    /**
     * Reset the form values on the mount and unmount so that old errors don't show when this form is displayed again.
     */
    useEffect(() => {
        PaymentMethods.clearDebitCardFormErrorAndSubmit();

        return () => {
            PaymentMethods.clearDebitCardFormErrorAndSubmit();
        };
    }, []);

    useEffect(() => {
        if (prevFormDataSetupComplete || !props.formData.setupComplete) {
            return;
        }

        PaymentMethods.continueSetup();
    }, [prevFormDataSetupComplete, props.formData.setupComplete]);

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    const validate = (values) => {
        const requiredFields = ['nameOnCard', 'cardNumber', 'expirationDate', 'securityCode', 'addressStreet', 'addressZipCode', 'addressState'];
        const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);

        if (values.nameOnCard && !ValidationUtils.isValidLegalName(values.nameOnCard)) {
            errors.nameOnCard = 'addDebitCardPage.error.invalidName';
        }

        if (values.cardNumber && !ValidationUtils.isValidDebitCard(values.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = 'addDebitCardPage.error.debitCardNumber';
        }

        if (values.expirationDate && !ValidationUtils.isValidExpirationDate(values.expirationDate)) {
            errors.expirationDate = 'addDebitCardPage.error.expirationDate';
        }

        if (values.securityCode && !ValidationUtils.isValidSecurityCode(values.securityCode)) {
            errors.securityCode = 'addDebitCardPage.error.securityCode';
        }

        if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
            errors.addressStreet = 'addDebitCardPage.error.addressStreet';
        }

        if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
            errors.addressZipCode = 'addDebitCardPage.error.addressZipCode';
        }

        if (!values.acceptTerms) {
            errors.acceptTerms = 'common.error.acceptTerms';
        }

        return errors;
    };

    if (!Permissions.canUseWallet(props.betas)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => nameOnCardRef.current && nameOnCardRef.current.focus()}
            includeSafeAreaPaddingBottom={false}
            testID={DebitCardPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('addDebitCardPage.addADebitCard')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM}
                validate={validate}
                onSubmit={PaymentMethods.addPaymentCard}
                submitButtonText={translate('common.save')}
                scrollContextEnabled
                style={[styles.mh5, styles.flexGrow1]}
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID="nameOnCard"
                    label={translate('addDebitCardPage.nameOnCard')}
                    accessibilityLabel={translate('addDebitCardPage.nameOnCard')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    ref={nameOnCardRef}
                    spellCheck={false}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID="cardNumber"
                    label={translate('addDebitCardPage.debitCardNumber')}
                    accessibilityLabel={translate('addDebitCardPage.debitCardNumber')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    containerStyles={[styles.mt4]}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                />
                <View style={[styles.flexRow, styles.mt4]}>
                    <View style={[styles.flex1, styles.mr2]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="expirationDate"
                            label={translate('addDebitCardPage.expiration')}
                            accessibilityLabel={translate('addDebitCardPage.expiration')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            placeholder={translate('addDebitCardPage.expirationDate')}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                            maxLength={4}
                        />
                    </View>
                    <View style={[styles.flex1]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="securityCode"
                            label={translate('addDebitCardPage.cvv')}
                            accessibilityLabel={translate('addDebitCardPage.cvv')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            maxLength={4}
                            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        />
                    </View>
                </View>
                <View>
                    <InputWrapper
                        InputComponent={AddressSearch}
                        inputID="addressStreet"
                        label={translate('addDebitCardPage.billingAddress')}
                        containerStyles={[styles.mt4]}
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                        // Limit the address search only to the USA until we fully can support international debit cards
                        isLimitedToUSA
                    />
                </View>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID="addressZipCode"
                    label={translate('common.zip')}
                    accessibilityLabel={translate('common.zip')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                    hint={translate('common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples})}
                    containerStyles={[styles.mt4]}
                />
                <View style={[styles.mt4, styles.mhn5]}>
                    <InputWrapper
                        InputComponent={StatePicker}
                        inputID="addressState"
                    />
                </View>
                <InputWrapper
                    InputComponent={CheckboxWithLabel}
                    accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('common.expensifyTermsOfService')}`}
                    inputID="acceptTerms"
                    defaultValue={false}
                    LabelComponent={() => (
                        <Text>
                            {`${translate('common.iAcceptThe')}`}
                            <TextLink href={CONST.TERMS_URL}>{`${translate('common.expensifyTermsOfService')}`}</TextLink>
                        </Text>
                    )}
                    style={[styles.mt4]}
                />
            </FormProvider>
        </ScreenWrapper>
    );
}

DebitCardPage.propTypes = propTypes;
DebitCardPage.defaultProps = defaultProps;
DebitCardPage.displayName = 'DebitCardPage';

export default withOnyx({
    formData: {
        key: ONYXKEYS.FORMS.ADD_DEBIT_CARD_FORM,
    },
    betas: {
        key: ONYXKEYS.BETAS,
    },
})(DebitCardPage);
