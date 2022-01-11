/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import ClayDatePicker from '@clayui/date-picker';
import moment from 'moment/min/moment-with-locales';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createAutoCorrectedDatePipe} from 'text-mask-addons';
import {createTextMaskInputElement} from 'text-mask-core';

import {FieldBase} from '../FieldBase/ReactFieldBase.es';

const DIGIT_REGEX = /\d/i;
const LETTER_REGEX = /[a-z]/i;
const LETTER_DIGIT_REGEX = /[A-Z0-9]/gi;
const NOT_LETTER_REGEX = /[^a-z]/gi;
const YEARS_INDEX = 6;

const getLocaleDateFormat = (locale) => {
	moment.locale(locale);

	return moment.localeData().longDateFormat('L');
};

const getInputMaskFormat = (locale) => {
	const dateFormat = getLocaleDateFormat(locale);

	const inputMask = [...dateFormat].map((char) =>
		LETTER_REGEX.test(char) ? DIGIT_REGEX : char
	);

	return inputMask;
};

const getInitialMonth = (value) => {
	if (moment(value).isValid()) {
		return moment(value).toDate();
	}

	return moment().toDate();
};

const getInitialValue = (defaultLanguageId, value, locale, localizedValue) => {
	if (typeof value === 'string' && value !== '' && !value.includes('_')) {
		const formatInEditingLocale =
			localizedValue &&
			localizedValue[locale] !== undefined &&
			localizedValue[locale] !== null;

		const currentLocale = formatInEditingLocale
			? locale
			: defaultLanguageId;

		const localizedDateFormat = getLocaleDateFormat(currentLocale);

		return moment(value, [localizedDateFormat, 'YYYY-MM-DD']).format(
			localizedDateFormat
		);
	}

	return value;
};

const getMomentMask = (locale, isDatetime) => {
	let momentMask;

	const momentLocale = moment().locale(locale);

	const date = momentLocale.localeData().longDateFormat('L');
	const time = momentLocale.localeData().longDateFormat('LT');

	if (isDatetime) {
		const [hourFormat] = time.split(NOT_LETTER_REGEX, 1);
		if (hourFormat.length === 1) {
			const newTime = hourFormat[0] === 'H' ? `H${time}` : `h${time}`;
			momentMask = `${date} ${newTime}`;
		}
		else {
			momentMask = `${date} ${time}`;
		}
	}
	else {
		momentMask = date;
	}

	return momentMask;
};

const getClayMask = (locale) => {
	const dateFormat = getLocaleDateFormat(locale);
	//const lastSymbol = dateFormat.slice(-1).match(NOT_LETTER_REGEX);
	//const clayMask = (lastSymbol ? dateFormat.slice(0, -1) : dateFormat)
	const clayMask = dateFormat
		.replace('YYYY', 'yyyy')
		.replace('DD', 'dd');

	console.log(clayMask);

	return clayMask;
};

const getPipeMask = (momentMask, isDateTime) => {
	let pipeMask = momentMask;

	if (isDateTime) {
		// precisa fazer isso aqui de outro jeito
		let date = pipeMask.slice(0, 11);
		let time = pipeMask.slice(11, pipeMask.length);
		const lastSymbol = date.slice(-1).match(NOT_LETTER_REGEX);
		date = (lastSymbol ? date.slice(0, -1) : date).toLowerCase();
		time = time.replace('hh', 'HH')
		.replace('mm', 'MM');
		pipeMask = `${date}${time}`;

	} else {
		const lastSymbol = pipeMask.slice(-1).match(NOT_LETTER_REGEX);
		pipeMask = (lastSymbol ? pipeMask.slice(0, -1) : pipeMask).toLowerCase();
	}

	return pipeMask;


};

const getValueForHidden = (value, isDatetime, dateMasks) => {
	let newMoment = moment(value, dateMasks.momentMask, true);

	if (newMoment.isValid()) {
		return newMoment.locale('en-US').format('YYYY-MM-DD');
	}

	return '';
};

const Months = [
	Liferay.Language.get('january'),
	Liferay.Language.get('february'),
	Liferay.Language.get('march'),
	Liferay.Language.get('april'),
	Liferay.Language.get('may'),
	Liferay.Language.get('june'),
	Liferay.Language.get('july'),
	Liferay.Language.get('august'),
	Liferay.Language.get('september'),
	Liferay.Language.get('october'),
	Liferay.Language.get('november'),
	Liferay.Language.get('december'),
];

const WeekdayShort = [
	Liferay.Language.get('weekday-short-sunday'),
	Liferay.Language.get('weekday-short-monday'),
	Liferay.Language.get('weekday-short-tuesday'),
	Liferay.Language.get('weekday-short-wednesday'),
	Liferay.Language.get('weekday-short-thursday'),
	Liferay.Language.get('weekday-short-friday'),
	Liferay.Language.get('weekday-short-saturday'),
];

const DatePicker = ({
	defaultLanguageId,
	disabled,
	locale,
	localizable,
	localizedValue: localizedValueInitial = {},
	name,
	onBlur,
	onChange,
	onFocus,
	type,
	value: initialValue,
}) => {

	const isDateTime = true;

	// const isDateTime = type === 'date_time';

	if (isDateTime) {
		const momentLocale = moment().locale(locale);
		const time = momentLocale.localeData().longDateFormat('LT');
		use12Hours = time.endsWith('A');
	}

	const inputRef = useRef(null);
	const maskInstanceRef = useRef(null);

	const [expanded, setExpand] = useState(false);

	const [localizedValue, setLocalizedValue] = useState(localizedValueInitial);

	const initialValueMemoized = useMemo(
		() =>
			getInitialValue(
				defaultLanguageId,
				initialValue,
				locale,
				localizedValue
			),
		[defaultLanguageId, initialValue, locale, localizedValue]
	);

	const dateMasks = useMemo(() => {
		const momentMask = getMomentMask(locale, isDateTime);
		const clayMask = getClayMask(locale);
		const pipeMask = getPipeMask(momentMask, isDateTime);

		return {
			momentMask,
			clayMask,
			pipeMask
		};
	}, [locale, defaultLanguageId]);

	console.log(dateMasks);

	const [value, setValue] = useState(initialValueMemoized);

	useEffect(() => {
		setValue(initialValueMemoized);
	}, [initialValueMemoized]);

	const [years, setYears] = useState(() => {
		const currentYear = new Date().getFullYear();

		return {
			end: currentYear + 5,
			start: currentYear - 5,
		};
	});

	const inputMask = getInputMaskFormat(locale);

	useEffect(() => {
		if (inputRef.current && inputMask && dateMasks.clayMask) {
			maskInstanceRef.current = createTextMaskInputElement({
				guide: true,
				inputElement: inputRef.current,
				keepCharPositions: true,
				mask: inputMask,
				pipe: createAutoCorrectedDatePipe('dd/mm/yyyy HH:MM'),
				showMask: true,
			});

			const currentValue = localizable ? localizedValue[locale] : value;

			if (currentValue) {
				if (
					currentValue !== inputRef.current.value ||
					!/[//.-]/.test(currentValue)
				) {
					inputRef.current.value = moment(currentValue).format(
						dateMasks.momentMask
					);
				}
			}
			else if (initialValueMemoized) {
				var year = parseInt(
					initialValueMemoized.substr(YEARS_INDEX),
					10
				);

				const date = moment(initialValueMemoized);

				if (year <= 50) {
					date.subtract(2000, 'years');
				}
				else if (year > 50 && year < 100) {
					date.subtract(1900, 'years');
				}

				inputRef.current.value = date.format(dateMasks.momentMask);
			}
			else {
				inputRef.current.value = '';
			}

			if (
				inputRef.current.value.match(LETTER_DIGIT_REGEX) ||
				inputRef.current.value === ''
			) {
				maskInstanceRef.current.update(inputRef.current.value);
			}
		}
	}, [
		dateMasks,
		inputMask,
		inputRef,
		initialValueMemoized,
		localizable,
		localizedValue,
		locale,
		value,
	]);

	console.log(getMomentMask(locale, isDateTime));

	// console.log("newHidden");

	// console.log(getValueForHidden(value, locale, isDateTime));

	const handleNavigation = (date) => {
		const currentYear = date.getFullYear();

		setYears({
			end: currentYear + 5,
			start: currentYear - 5,
		});
	};

	return (
		<>
			<input
				name={name}
				type="hidden"
				value={getValueForHidden(value, isDateTime, dateMasks)}
			/>
			<ClayDatePicker
				dateFormat={dateMasks.clayMask}
				disabled={disabled}
				expanded={expanded}
				initialMonth={getInitialMonth(value)}
				months={Months}
				onBlur={onBlur}
				onExpandedChange={(expand) => {
					setExpand(expand);
				}}
				onFocus={onFocus}
				onInput={(event) => {
					maskInstanceRef.current.update(event.target.value);
					setLocalizedValue({
						...localizedValue,
						[locale]: event.target.value,
					});
				}}
				onNavigation={handleNavigation}
				onValueChange={(value, eventType) => {
					setLocalizedValue({
						...localizedValue,
						[locale]: value,
					});

					setValue(value);

					if (eventType === 'click') {
						setExpand(false);
						inputRef.current.focus();
					}

					if (
						!value ||
						value ===
							maskInstanceRef.current.state.previousPlaceholder
					) {
						return onChange('');
					}

					if (
						moment(
							value,
							getLocaleDateFormat(locale),
							true
						).isValid()
					) {
						onChange(
							getValueForHidden(value, isDateTime, dateMasks)
						);
					}
				}}
				ref={inputRef}
				time={isDateTime}
				use12Hours={use12Hours}
				value={value}
				weekdaysShort={WeekdayShort}
				years={years}
			/>
		</>
	);
};

const Main = ({
	defaultLanguageId,
	locale = themeDisplay.getDefaultLanguageId(),
	localizable,
	localizedValue,
	name,
	onBlur,
	onChange,
	onFocus,
	placeholder,
	predefinedValue,
	readOnly,
	type,
	value,
	...otherProps
}) => {
	return (
		<FieldBase
			{...otherProps}
			localizedValue={localizedValue}
			name={name}
			readOnly={readOnly}
		>
			<DatePicker
				defaultLanguageId={defaultLanguageId}
				disabled={readOnly}
				locale={locale}
				localizable={localizable}
				localizedValue={localizedValue}
				name={name}
				onBlur={onBlur}
				onChange={(value) => onChange({}, value)}
				onFocus={onFocus}
				placeholder={placeholder}
				type={type}
				value={value ? value : predefinedValue}
			/>
		</FieldBase>
	);
};

Main.displayName = 'DatePicker';

export default Main;
