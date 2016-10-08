///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
/*require({
    packages: [
        {
            name: "bootstrap",
            location: document.location.pathname.replace(/\/[^/]+$/, '') + '/widgets/MonWidget/libs/Dojo-Bootstrap',
        }
    ]
});*/
define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    'dijit/_WidgetsInTemplateMixin',

		'dojo/dom-construct',
    'dojo/on',
    'dojo/query',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/config',

    'esri/core/watchUtils',

    'dijit/form/HorizontalSlider',
    'dijit/form/Select',
    'jimu/dijit/CheckBox',

    'bootstrap/Tab',
    'bootstrap/Datepicker'
  ], function (declare, BaseWidget, _WidgetsInTemplateMixin,
	domConstruct, on, query, lang, html, djConfig,
	watchUtils) {

	var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {

		name: 'MonWidget',

		baseClass: 'jimu-widget-monwidget',

		postCreate: function () {
			this.inherited(arguments);

			//init UI
			var date = new Date();
			this._initDatePicker(date);
			this._updateSliderUIByDate(date);

			//bind events
			var lighting = this.sceneView.environment.lighting;
			this.own(on(lighting, "date-will-change", lang.hitch(this, this._onDateWillChange)));
			this.own(on(this.slider, 'change', lang.hitch(this, this._onSliderValueChanged)));

			var showShadowContainer = false;
			if (this.sceneView._stage.getRenderParams().shadowMap !== undefined) {
				showShadowContainer = true;
				var directShadowLabel = this.nls.directShadow + "&lrm;";
				this.cbxDirect.setLabel(directShadowLabel);
				this.own(watchUtils.init(this.sceneView,
					"environment.lighting.directShadowsEnabled",
					lang.hitch(this, this._onWatchDirectShadows)));
				this.cbxDirect.onChange = lang.hitch(this, this._onDirectShadowChange);
			} else {
				html.setStyle(this.directShadowSection, 'display', 'none');
			}

			if (this.sceneView._stage.getRenderParams().ssao !== undefined) {
				showShadowContainer = true;
				var diffuseShadowLabel = this.nls.diffuseShadow + "&lrm;";
				this.cbxDiffuse.setLabel(diffuseShadowLabel);
				this.own(watchUtils.init(this.sceneView,
					"environment.lighting.ambientOcclusionEnabled",
					lang.hitch(this, this._onWatchAmbientOcclusion)));
				this.cbxDiffuse.onChange = lang.hitch(this, this._onDiffuseShadowChange);
			} else {
				html.setStyle(this.diffuseShadowSection, 'display', 'none');
			}

			if (!showShadowContainer) {
				html.setStyle(this.shadowContainer, 'display', 'none');
			}
		},

		startup: function () {
			// Init date picker
			query('#datePicker').datepicker({
					format: 'dd/mm/yyyy'
				})
				.on('changeDate', lang.hitch(this, function (ev) {
					console.log(ev.date);
					this._onDatePickerChanged(ev.date);
				}));
		},

		_setDateOfLighting: function (newDate) {
			var date = this._getDateOfLighting();
			if (date.getTime() !== newDate.getTime()) {
				this.sceneView.environment.lighting.date = newDate;
			}
		},

		_initDatePicker: function (date) {
			var year = date.getUTCFullYear();
			var tmpMonth = String(date.getUTCMonth() + 1);
			var month = tmpMonth.length == 1 ? '0' + tmpMonth : tmpMonth;
			var day = date.getUTCDate();
			this.datePicker.value = day + '/' + month + '/' + year;
			this._setDateOfLighting(date);
		},

		_updateSliderUIByDate: function (newDate) {
			var timeZone = this._getTimeZoneByUI();
			var h = (((newDate.getUTCHours() + timeZone) % 24) + 24) % 24;
			var m = newDate.getUTCMinutes();
			var s = newDate.getUTCSeconds();

			var oldValue = this.slider.get("value");
			var newValue = h + (m / 60) + (s / 3600);
			this._updateSunTimeUIByDate(newDate);
			if (oldValue !== newValue) {
				this.slider.set('value', newValue);
			}
		},

		_updateSunTimeUIByDate: function (date) {
			var tempDate = new Date(date);
			var timeZone = this._getTimeZoneByUI();
			var h = (((date.getUTCHours() + timeZone) % 24) + 24) % 24;
			tempDate.setHours(h);
			//		this.sunTime.innerHTML = tempDate.toLocaleString("en-us", {
			this.sunTime.innerHTML = tempDate.toLocaleString("fr-fr", {
				"hour": "numeric",
				"minute": "numeric"
			});
		},

		_getDateOfLighting: function () {
			return this.sceneView.environment.lighting.get('date');
		},

		_getDateByUI: function () {
			//return the Date object configured by UI settings
			var date = this._getDateOfLighting();
			var newDate = new Date(date);
			var timeZone = this._getTimeZoneByUI();
			var sliderValue = this.slider.get('value');

			var h = (((Math.floor(sliderValue) - timeZone) % 24) + 24) % 24;
			var m = 60 * (sliderValue - Math.floor(sliderValue));
			var minfrac = m % 1;
			m -= minfrac;
			var s = Math.round(minfrac * 60);

			newDate.setUTCHours(h);
			newDate.setUTCMinutes(m);
			newDate.setUTCSeconds(s);

			return newDate;
		},

		_getTimeZoneByUI: function () {
			return 1;
		},

		_getPositionTimeZone: function () {
			return this.sceneView.environment.lighting.positionTimezoneInfo.hours;
		},

		_onDateWillChange: function (evt) {
			this._updateSliderUIByDate(evt.date);
		},

		_onZoneSelectChanged: function () {
			this.slider.ignoreChangeEvent = true;
			var date = this._getDateOfLighting();
			this._updateSliderUIByDate(date);
		},

		_onDatePickerChanged: function (date) {
			var lightingDate = this._getDateOfLighting();
			var newDate = new Date(lightingDate);
			newDate.setUTCFullYear(date.getUTCFullYear());
			newDate.setUTCMonth(date.getUTCMonth());
			newDate.setDate(date.getUTCDate());
			this._setDateOfLighting(newDate);
		},

		_onSliderValueChanged: function () {
			//When Slider UI change, time zone doesn't change but hour is changed.
			//Once hour is changed, we should update date.
			var newDate = this._getDateByUI();
			this._updateSunTimeUIByDate(newDate);

			var ignoreChangeEvent = this.slider.ignoreChangeEvent;

			delete this.slider.ignoreChangeEvent;

			if (ignoreChangeEvent) {
				return;
			}

			this._setDateOfLighting(newDate);
		},

		_onWatchDirectShadows: function (directShadows) {
			this.cbxDirect.setValue(directShadows);
		},

		_onWatchAmbientOcclusion: function (ambientOcclusion) {
			this.cbxDiffuse.setValue(ambientOcclusion);
		},

		_onDirectShadowChange: function () {
			var value = this.cbxDirect.getValue();
			this.sceneView.environment.lighting.directShadowsEnabled = value;
		},

		_onDiffuseShadowChange: function () {
			var value = this.cbxDiffuse.getValue();
			this.sceneView.environment.lighting.ambientOcclusionEnabled = value;
		}

	});

	return clazz;
});