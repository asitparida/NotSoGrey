angular.module('NotSoGrey')
.service("SharedService", ["$http", "$q", "$uibModal", "$window", "$resource", function ($http, $q, $uibModal, $window, $resource) {
    var self = this;
    try {
        let electron = require('electron');
        let _currWindow = electron.remote.getCurrentWindow();
        self.activeColor = _currWindow.activeColor || '#c0392b';
    } catch (e) {
        self.activeColor = '#c0392b';
    }
    self.uibModal = $uibModal;
    self.actions = [];
    self.resource = $resource;
    self.preLoadedThemeInEdit = false;
    self.preLoadedTheme = null;
    try {
        self.electron = require('electron');
    } catch (e) {
        self.electron = null;
    }

    self.colorContrastModes = [
        { id: 1, name: 'Normal Vision', key: 'normal', anomalize: false },
        { id: 2, name: 'Protanopia', key: 'protan', anomalize: false },
        { id: 3, name: 'Protanomaly', key: 'protan', anomalize: true },
        { id: 4, name: 'Deuteranopia', key: 'deutan', anomalize: false },
        { id: 5, name: 'Deuteranomaly', key: 'deutan', anomalize: true },
        { id: 6, name: 'Tritanopia', key: 'tritan', anomalize: false },
        { id: 7, name: 'Tritanomaly', key: 'tritan', anomalize: true },
        { id: 8, name: 'Achromatopsia', key: 'achroma', anomalize: false },
        { id: 9, name: 'Achromatomaly', key: 'achroma', anomalize: true },
    ];

    self.baseColorWheel = [
        { id: 1, h: 28, s: 1, v: 1, b: 15, t: 36, o: 7, so: 6 },
        { id: 2, h: 0, s: 1, v: 0.99, b: 337, t: 14, o: 8, so: 5 },
        { id: 3, h: 312, s: 0.99, v: 0.75, b: 301, t: 336, o: 9, so: 4 },
        { id: 4, h: 287, s: 1, v: 0.75, b: 280, t: 300, o: 10, so: 3 },
        { id: 5, h: 272, s: 1, v: 0.75, b: 258, t: 279, o: 11, so: 2 },
        { id: 6, h: 241, s: 1, v: 1, b: 208, t: 257, o: 0, so: 1 },
        { id: 7, h: 172, s: 1, v: 0.75, b: 147, t: 207, o: 1, so: 12 },
        { id: 8, h: 119, s: 0.99, v: 0.75, b: 95, t: 146, o: 2, so: 11 },
        { id: 9, h: 71, s: 1, v: 1, b: 67, t: 94, o: 3, so: 10 },
        { id: 10, h: 61, s: 1, v: 1, b: 58, t: 66, o: 4, so: 9 },
        { id: 11, h: 52, s: 1, v: 1, b: 49, t: 57, o: 5, so: 8 },
        { id: 12, h: 44, s: 1, v: 1, b: 37, t: 48, o: 6, so: 7 }
    ];

    self.correctForBlindness = function (color, mode) {
        var _tc = tinycolor(color);
        var _tcRGB = _tc.toRgb();
        var _cbRGB = { R: _tcRGB.r, G: _tcRGB.g, B: _tcRGB.b };
        var _transformed = Color.Blind(_cbRGB, mode.key, mode.anomalize);
        _tcRGB = { r: _transformed.R, g: _transformed.G, b: _transformed.B };
        return tinycolor(_tcRGB).toHexString();
    }

    self.themeGeneratorOptions = [
        { id: 1, name: 'Preloaded Themes' },
        { id: 2, name: 'Monochromatic' },
        { id: 3, name: 'Analogous' },
        { id: 4, name: 'Custom Complementary' },
    ];

    self.getBaseWheelColor = function (color) {
        var _tc = tinycolor(color);
        var _tcHsv = _tc.toHsv();
        var match = null;
        if ((_tcHsv.h >= 337 && _tcHsv.h <= 360) || (_tcHsv.h >= 0) && (_tcHsv.h <= 14))
            match = self.baseColorWheel[1];
        else
            match = _.find(self.baseColorWheel, function (bc) { return (_tcHsv.h >= bc.b) && (_tcHsv.h <= bc.t) });
        return match;
    }

    self.getOppositeBaseWheelColor = function (bwc, split) {
        var _bwc = _.find(self.baseColorWheel, function (bc) { return bc.id == bwc.id });
        if (_bwc) {
            return _.find(self.baseColorWheel, function (bc) {
                if (split != true)
                    return bc.id == _bwc.o
                else
                    return bc.id == _bwc.so
            })
        }
        return null;
    }

    self.getAnalogousColors = function (bwc) {
        var _bwc = _.find(self.baseColorWheel, function (bc) { return bc.id == bwc.id });
        var _bwcIndex = _bwc.id;
        var _ranges = [];
        if (_bwcIndex == 1)
            _ranges = [[11, 12, 1], [12, 1, 2], [1, 2, 3]];
        else if (_bwcIndex == 2)
            _ranges = [[12, 1, 2], [1, 2, 3], [2, 3, 4]];
        else if (_bwcIndex == 11)
            _ranges = [[9, 10, 11], [10, 11, 12], [11, 12, 1]];
        else if (_bwcIndex == 12)
            _ranges = [[10, 11, 12], [11, 12, 1], [12, 1, 2]];
        else
            _ranges = [[_bwcIndex - 2, _bwcIndex - 1, _bwcIndex], [_bwcIndex - 1, _bwcIndex, _bwcIndex + 1], [_bwcIndex, _bwcIndex + 1, _bwcIndex + 2]];

        var _sampledRange = _.sample(_ranges);
        var _analogousColors = [];
        _.each(_sampledRange, function (id) {
            var _c = _.find(self.baseColorWheel, function (bc) { return bc.id == id });
            if (_c)
                _analogousColors.push(_c);
        });
        return _analogousColors;
    }

    self.adjustHueValue = function (_colorHsv, _baseWheelColor, _targetWheelColor) {
        var _diff;
        var _diffPerc = 0;
        var _resultantHue = _targetWheelColor.h;
        var _directionPositive = false;
        if (_baseWheelColor.id != 2) {
            _diff = _baseWheelColor.h - _colorHsv.h;
            if (_diff > 0) {
                _diffPerc = Math.abs(_diff) / (_baseWheelColor.h - _baseWheelColor.b);
                _directionPositive = false;
            }
            else if (_diff < 0) {
                _diffPerc = Math.abs(_diff) / (_baseWheelColor.t - _baseWheelColor.h);
                _directionPositive = true;
            }
        }
        else {
            if (_colorHsv.h >= 337 && _colorHsv.h <= 360) {
                _diff = 360 - _colorHsv.h
                _diffPerc = Math.abs(_diff) / (360 - _baseWheelColor.b);
                _directionPositive = false;
            }
            else if ((_colorHsv.h >= 0) && (_colorHsv.h <= 14)) {
                _diff = 0 - _colorHsv.h;
                _diffPerc = Math.abs(_diff) / (_baseWheelColor.h - 0);
                _directionPositive = true;
            }
        }
        if (_targetWheelColor.id != 2) {
            if (_directionPositive == true) {
                _deflection = _diffPerc * (_targetWheelColor.t - _targetWheelColor.h);
                _resultantHue = _targetWheelColor.h - _deflection;
            }
            else {
                _deflection = _diffPerc * (_targetWheelColor.h - _targetWheelColor.b);
                _resultantHue = _targetWheelColor.h + _deflection;
            }
        }
        else {
            _resultantHue = _targetWheelColor.h;
        }
        return _resultantHue;
    }

    self.loadActions = function (items) {
        self.actions = [];
        angular.forEach(items, function (item) {
            self.actions.push(angular.copy(item));
        });
    }

    self.writeToClipboard = function (data) {
        let electron = require('electron');
        electron.clipboard.writeText(data.toString());
    }

    self.getCodeOnlyFromHexCode = function (hex) {
        return tinycolor(hex).toHex();
    }

    self.getHexFromCode = function (code) {
        return tinycolor(code).toHexString();
    }

    self.getRGBCodeOnlyFromHexCode = function (hex) {
        return tinycolor(hex).toRgb();
    }

    self.getHSVCodeOnlyFromHexCode = function (hex) {
        return tinycolor(hex).toHsv();
    }

    self.getContrastRatio = function (color1, color2) {
        var _ratio = tinycolor.readability(tinycolor(color1), tinycolor(color2));
        return Math.round(_ratio * 100) / 100;
    }

    self.isLight = function (color) {
        return tinycolor(color).isLight();
    }

    /* COLOR FACTORY METHODS */
    self.getForegrundContrastedColor = function (incoingHex) {
        var _color = tinycolor(incoingHex);
        var _blackContrast = tinycolor.readability(_color, tinycolor('#000000'));
        var _whiteContrast = tinycolor.readability(_color, tinycolor('#ffffff'));
        if (_blackContrast > _whiteContrast)
            return '#000000';
        else if (_blackContrast < _whiteContrast)
            return '#ffffff';
        if (_blackContrast == _whiteContrast)
            return _.sample(['#000000', '#ffffff']);
        return '';
    }

    self.getCMYK = function (incomingColor) {

        var _rgbColor = tinycolor(incomingColor).toRgb();
        var r = _rgbColor.r;
        var g = _rgbColor.g;
        var b = _rgbColor.b;

        var computedC = 0;
        var computedM = 0;
        var computedY = 0;
        var computedK = 0;

        //remove spaces from input RGB values, convert to int
        r = parseInt(('' + r).replace(/\s/g, ''), 10);
        g = parseInt(('' + g).replace(/\s/g, ''), 10);
        b = parseInt(('' + b).replace(/\s/g, ''), 10);

        if (r == null || g == null || b == null ||
            isNaN(r) || isNaN(g) || isNaN(b)) {
            alert('Please enter numeric RGB values!');
            return;
        }
        if (r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255) {
            alert('RGB values must be in the range 0 to 255.');
            return;
        }

        // BLACK
        if (r == 0 && g == 0 && b == 0) {
            computedK = 1;
            return [0, 0, 0, 1];
        }

        computedC = 1 - (r / 255);
        computedM = 1 - (g / 255);
        computedY = 1 - (b / 255);

        var minCMY = Math.min(computedC,
                     Math.min(computedM, computedY));
        computedC = (computedC - minCMY) / (1 - minCMY);
        computedM = (computedM - minCMY) / (1 - minCMY);
        computedY = (computedY - minCMY) / (1 - minCMY);
        computedK = minCMY;

        return { c: computedC, m: computedM, y: computedY, k: computedK };
    }

    self.getPercentageCMYK = function (incomingColor) {
        var _result = self.getCMYK(incomingColor);
        return {
            c: Math.round(_result.c * 100),
            m: Math.round(_result.m * 100),
            y: Math.round(_result.y * 100),
            k: Math.round(_result.k * 100)
        };
    }

    self.getPercentageRGB = function (incomingColor) {
        var _color = tinycolor(incomingColor);
        var _rgbColor = _color.toRgb();
        return {
            r: Math.round((_rgbColor.r / 255) * 100),
            g: Math.round((_rgbColor.g / 255) * 100),
            b: Math.round((_rgbColor.b / 255) * 100)
        };
    }

    self.getPercentageHSB = function (incomingColor) {
        var _color = tinycolor(incomingColor);
        var _hsbColor = _color.toHsv();
        return {
            h: Math.round(_hsbColor.h),
            s: Math.round(_hsbColor.s * 100),
            b: Math.round(_hsbColor.v * 100),
        };
    }

    self.getNextHueHex = function (color) {
        var _tc = tinycolor(color).toHsv();
        _tc.h = _tc.h + 18;
        if (_tc.h > 360)
            _tc.h = _tc.h - 360;
        return tinycolor(_tc).toHexString();
    }

    self.getPreviousHueHex = function (color) {
        var _tc = tinycolor(color).toHsv();
        _tc.h = _tc.h - 18;
        if (_tc.h < 0)
            _tc.h = 360 + _tc.h;
        return tinycolor(_tc).toHexString();
    }

    self.processForShades = function (color) {
        var _colors = [];
        var _desatColors = [];
        var _satColors = [];
        _.each(_.range(6), function (i) {
            _satColors.push({ id: '_sat_' + i, hexCode: tinycolor(color).brighten(10 * (i + 1)).toHexString(), type: 'sat' + i });
        });
        _.each(_.range(6), function (i) {
            _desatColors.push({ id: '_desat_' + i, hexCode: tinycolor(color).darken(5 * (i + 1)).toHexString(), type: 'desat' + i });
        });
        _desatColors = _desatColors.reverse();
        _colors = _colors.concat(_desatColors);
        _colors = _colors.concat([{ id: '_nor_', hexCode: color }]);
        _colors = _colors.concat(_satColors);
        _colors = _colors.reverse();

        var _offset = 0;
        var _chart = [0, 30, 35, 40, 45, 50, 55, 25, 30, 35, 40, 45, 50];
        var z = 0;
        _.each(_colors, function (shade, iter) {
            var _offsetCalc = 0;
            if (iter <= 6) {
                z++;
                shade.topOffset = _offset + _chart[iter];
                shade.zindex = z;
            }
            else if (iter > 6) {
                z--;
                shade.topOffset = _offset + 80 - _chart[iter];
                shade.zindex = z;
            }
            if (iter == 6) shade.primary = true;
            shade.foreColor = self.getForegrundContrastedColor(shade.hexCode);
            _offset = shade.topOffset;
        });
        return { 'shades': _colors, 'height': _.last(_colors).topOffset + 80 };
    }

    var _defer;
    self.handleChangeInColor = function (type, orig, currHex) {
        if (_defer) _defer.reject();
        _defer = $q.defer();
        try {
            var _result;
            if (type == 'cmyk')
                _result = self.handleCMYKChange(orig);
            else if (type == 'rgb')
                _result = self.handleRGBChange(orig);
            else if (type == 'hsb')
                _result = self.handleHSBChange(orig);
            _defer.resolve(_result);

        } catch (e) {
            _defer.resolve(currHex);
        }
        return _defer.promise;
    }

    self.handleCMYKChange = function (cmyk) {
        var _color = {
            r: Math.round(255 * (1 - (cmyk.c / 100)) * (1 - (cmyk.k / 100))),
            g: Math.round(255 * (1 - (cmyk.m / 100)) * (1 - (cmyk.k / 100))),
            b: Math.round(255 * (1 - (cmyk.y / 100)) * (1 - (cmyk.k / 100)))
        };
        return tinycolor(_color).toHexString();
    }

    self.handleRGBChange = function (rgb) {
        var _color = {
            r: Math.round(255 * (rgb.r / 100)),
            g: Math.round(255 * (rgb.g / 100)),
            b: Math.round(255 * (rgb.b / 100))
        };
        return tinycolor(_color).toHexString();
    }

    self.handleHSBChange = function (hsb) {
        var _color = {
            h: hsb.h,
            s: hsb.s,
            v: hsb.b
        };
        return tinycolor(_color).toHexString();
    }

    self.handleChangeInCMYK = function (cmyk, currHex) {
        return self.handleChangeInColor('cmyk', cmyk, currHex);
    }

    self.handleChangeInRGB = function (rgb, currHex) {
        return self.handleChangeInColor('rgb', rgb, currHex);
    }

    self.handleChangeInHSB = function (hsb, currHex) {
        return self.handleChangeInColor('hsb', hsb, currHex);
    }

    self.generateThemes = function () {
        var _themeDefer = $q.defer();
        self.resource('dist/js/jsons/themes-popular.json').query().$promise
            .then(function (data) {
                var _color = tinycolor(self.activeColor).toHsv();
                var _result = [];
                _.each(data, function (palette, iter) {
                    var _palette = [];
                    var _insert = false;
                    _.each(palette, function (color) {
                        var _tc = tinycolor(color);
                        var _hsv = _tc.toHsv();
                        if ((_hsv.h >= (_color.h - 3) && _hsv.h <= (_color.h + 3))
                            && (_hsv.s >= (_color.s - 5) && _hsv.s <= (_color.s + 5))
                            && (_hsv.v >= (_color.v - 5) && _hsv.v <= (_color.v + 5))) {
                            _insert = _insert || true;
                        }
                        _palette.push(_tc.toHexString());
                    });
                    if (_insert)
                        _result.push({ id: (iter + 1), name: 'Beach Time ' + (iter + 1), colors: _palette });
                });
                self.preGeneratedThemes = _result;
                _themeDefer.resolve(_result);
            });
        return _themeDefer.promise;
    }

    self.processComboForTheme = function (theme) {
        var colors = [];
        _.each(theme.colors, function (_color, iter) {
            colors.push({ id: iter + 1, color: _color, locked: false });
        });
        return colors;
    }

    self.generateColorPalette = function (colors, mode) {
        if (mode.id == 1)
            return self.generateColorPaletteFromPreLoadedThemes();
        else if (mode.id == 2)
            return self.generateColorPaletteMonochromeUsingPlease(colors);
        else if (mode.id == 3)
            return self.generateColorPaletteAnalagous(colors);
        else if (mode.id == 4)
            return self.generateColorPaletteCustomComplementary(colors);
    }

    self.generateColorPaletteFromPreLoadedThemes = function () {
        var _theme = _.sample(self.preGeneratedThemes);
        return self.processComboForTheme(_theme);
    }

    self.generateMonochromeColorPaletteForColor = function (color) {
        var colors = [];
        _.each(_.range(5), function (iter) {
            colors.push({ id: iter + 1, color: color, locked: false });
        });
        colors[0].locked = true;
        var _primaryColor = tinycolor(colors[0].color);
        var _primaryColorHSV = _primaryColor.toHsv();
        var _gen = Please.make_scheme(_primaryColorHSV,
            {
                scheme_type: 'monochromatic',
                format: 'hex'
            });
        _.each(colors, function (_c, iter) {
            _c.color = _c.locked == true ? _c.color : _gen[iter];
            _c.foreColor = self.getForegrundContrastedColor(_c.color);
        });
        return colors;
    }

    self.generateColorPaletteMonochromeUsingPlease = function (colors) {
        var _primaryColor = tinycolor(colors[0].color);
        var _primaryColorHSV = _primaryColor.toHsv();
        if (colors[0].locked == false) {
            colors[0].color = tinycolor({ h: _.random(0, 360), s: _primaryColorHSV.s, v: _primaryColorHSV.v }).toHexString();
        }
        _primaryColor = tinycolor(colors[0].color);
        _primaryColorHSV = _primaryColor.toHsv();
        _primaryColorHSV = _primaryColor.toHsv();
        _primaryColorHSV.s = Math.round(_primaryColorHSV.s * 100);
        _primaryColorHSV.v = Math.round(_primaryColorHSV.v * 100);
        var _saturate = _.random(_primaryColorHSV.s * 0.50, 100);
        var _brighten = _.random(_primaryColorHSV.v * 0.50, 100);
        _primaryColorHSV.s = _saturate / 100;
        _primaryColorHSV.v = _brighten / 100;
        var _gen = Please.make_scheme(_primaryColorHSV,
            {
                scheme_type: 'monochromatic',
                format: 'hex'
            });
        _.each(colors, function (_c, iter) {
            _c.color = _c.locked == true ? _c.color : _gen[iter];
            _c.foreColor = self.getForegrundContrastedColor(_c.color);
        });
        return colors;
    }

    self.generateColorPaletteCustomComplementary = function (colors) {
        var _primaryColor = tinycolor(colors[0].color);
        var _primaryColorHSV = _primaryColor.toHsv();
        //GET OPPSITE HUE
        if (colors[0].locked == false) {
            colors[0].color = tinycolor({ h: _.random(0, 360), s: _primaryColorHSV.s, v: _primaryColorHSV.v }).toHexString();
        }
        _primaryColor = tinycolor(colors[0].color);
        _primaryColorHSV = _primaryColor.toHsv();
        var _bwc = self.getBaseWheelColor(_primaryColor);
        var _oppositeBwc = self.getOppositeBaseWheelColor(_bwc, _.sample([true, false]));
        //HUE ADJUSTMENT
        var _hue = self.adjustHueValue(_primaryColorHSV, _bwc, _oppositeBwc);
        var _saturate = _.random(_bwc.s * 100, 100);
        var _brighten = _.random(_bwc.v * 100, 100);
        //CHOOSING OPPOSITE AS 5TH
        if (_hue > 360)
            _hue = _hue - 360;
        if (colors[4].locked == false)
            colors[4].color = tinycolor({ 'h': _hue, 's': _saturate / 100, 'v': _brighten / 100 }).toHexString();
        //CHOOSING 2ND AS DARKENED 1ST AND 4TH AS DARKENED 5TH
        var _darken = _.random(0, _primaryColorHSV.v * 100);
        if (colors[1].locked == false)
            colors[1].color = tinycolor({ 'h': _primaryColorHSV.h, 's': _primaryColorHSV.s, 'v': _darken / 100 }).toHexString();
        if (colors[3].locked == false)
            colors[3].color = tinycolor({ 'h': _hue, 's': _saturate / 100, 'v': _darken / 100 }).toHexString();
        //CHOOSING 3RD
        var _desaturate = _.random(0, 20);
        var _brighten = _.random(75, 100);
        if (colors[2].locked == false)
            colors[2].color = tinycolor({ 'h': _primaryColorHSV.h, 's': _desaturate / 100, 'v': _brighten / 100 }).toHexString();
        _.each(colors, function (_c, iter) {
            _c.foreColor = self.getForegrundContrastedColor(_c.color);
        });
        return colors;
    }

    self.generateColorPaletteAnalagous = function (colors) {
        var _primaryColor = tinycolor(colors[0].color);
        var _primaryColorHSV = _primaryColor.toHsv();
        if (colors[0].locked == false) {
            colors[0].color = tinycolor({ h: _.random(0, 360), s: _primaryColorHSV.s, v: _primaryColorHSV.v }).toHexString();
            colors[0].foreColor = self.getForegrundContrastedColor();
        }
        _primaryColor = tinycolor(colors[0].color);
        _primaryColorHSV = _primaryColor.toHsv();
        _primaryColorHSV.s = Math.round(_primaryColorHSV.s * 100);
        _primaryColorHSV.v = Math.round(_primaryColorHSV.v * 100);
        var _saturate = _.random(_primaryColorHSV.s * 0.50, 100);
        var _brighten = _.random(_primaryColorHSV.v * 0.50, 100);
        _primaryColorHSV.s = _saturate / 100;
        _primaryColorHSV.v = _brighten / 100;
        var _gen = Please.make_scheme(_primaryColorHSV,
            {
                scheme_type: 'analogous',
                format: 'hex'
            });
        _.each(colors, function (_c, iter) {
            _c.color = _c.locked == true ? _c.color : _gen[iter];
            _c.foreColor = self.getForegrundContrastedColor(_c.color);
        });
        return colors;
    }

    self.getDribbleShots = function (color) {
        if (_defer) _defer.reject();
        _defer = $q.defer();
        try {
            if (self.electron != null) {
                self.electron.ipcRenderer.send('get-dribbble', tinycolor(color).toHex());
                self.electron.ipcRenderer.on('get-dribbble-reply', (event, arg) => {
                    _defer.resolve(arg);
                });
            }
            else
                _defer.resolve(["https://d13yacurqjgara.cloudfront.net/users/275149/screenshots/2831723/maplooper_1x.png", "https://d13yacurqjgara.cloudfront.net/users/698732/screenshots/2831032/004_1x.png", "https://d13yacurqjgara.cloudfront.net/users/124800/screenshots/2830714/workspace_1x.jpg", "https://d13yacurqjgara.cloudfront.net/users/14224/screenshots/2830043/03_1x.png", "https://d13yacurqjgara.cloudfront.net/users/159078/screenshots/2829616/landing-joined_1x.png", "https://d13yacurqjgara.cloudfront.net/users/159078/screenshots/2829606/signup-joined_1x.png", "https://d13yacurqjgara.cloudfront.net/users/159078/screenshots/2829591/checkout-joined_1x.png", "https://d13yacurqjgara.cloudfront.net/users/361038/screenshots/2829283/400.jpg", "https://d13yacurqjgara.cloudfront.net/users/790168/screenshots/2829055/dk_currency_1x.jpg", "https://d13yacurqjgara.cloudfront.net/users/261966/screenshots/2828771/untitled-1.png", "https://d13yacurqjgara.cloudfront.net/users/970944/screenshots/2827706/dribbble_0-60_1x.gif", "https://d13yacurqjgara.cloudfront.net/users/17255/screenshots/2826939/kaleidoscope_1x.png"]);

        } catch (e) {
            console.log(e);
            _defer.resolve(["https://d13yacurqjgara.cloudfront.net/users/275149/screenshots/2831723/maplooper_1x.png", "https://d13yacurqjgara.cloudfront.net/users/698732/screenshots/2831032/004_1x.png", "https://d13yacurqjgara.cloudfront.net/users/124800/screenshots/2830714/workspace_1x.jpg", "https://d13yacurqjgara.cloudfront.net/users/14224/screenshots/2830043/03_1x.png", "https://d13yacurqjgara.cloudfront.net/users/159078/screenshots/2829616/landing-joined_1x.png", "https://d13yacurqjgara.cloudfront.net/users/159078/screenshots/2829606/signup-joined_1x.png", "https://d13yacurqjgara.cloudfront.net/users/159078/screenshots/2829591/checkout-joined_1x.png", "https://d13yacurqjgara.cloudfront.net/users/361038/screenshots/2829283/400.jpg", "https://d13yacurqjgara.cloudfront.net/users/790168/screenshots/2829055/dk_currency_1x.jpg", "https://d13yacurqjgara.cloudfront.net/users/261966/screenshots/2828771/untitled-1.png", "https://d13yacurqjgara.cloudfront.net/users/970944/screenshots/2827706/dribbble_0-60_1x.gif", "https://d13yacurqjgara.cloudfront.net/users/17255/screenshots/2826939/kaleidoscope_1x.png"]);
        }
        return _defer.promise;
    }
    
    self.getColorName = function(color) {
        if (_defer) _defer.reject();
        _defer = $q.defer();
        try {
            if (self.electron != null) {
                self.electron.ipcRenderer.send('get-hexcodename', tinycolor(color).toHexString());
                self.electron.ipcRenderer.on('get-hexcodename-reply', (event, arg) => {
                    _defer.resolve(arg || color);
                });
            }
            else
                _defer.resolve(color);

        } catch (e) {
            console.log(e);
            _defer.resolve(color);
        }
        return _defer.promise;
    }

    self.notifySave = function (msg) {
        var _modalInstance = self.uibModal.open({
            animation: true,
            templateUrl: 'dist/js/templates/palette-save-modal.html',
            backdrop: false,
            controller: ['data', '$uibModalInstance', 'SharedService', function (data, uibModalInstance, SharedService) {
                var self = this;
                self.shared = SharedService;
                self.bgColor = self.shared.activeColor;
                self.foreColor = self.shared.getForegrundContrastedColor(self.bgColor);
                self.borderColor = tinycolor(self.foreColor).setAlpha(.33).toHexString();
                console.log(tinycolor(self.foreColor).setAlpha(.33));
                console.log(tinycolor(self.foreColor).setAlpha(.33).toHexString());
                self.data = data;
                self.dismiss = function () {
                    uibModalInstance.close();
                }
            }],
            controllerAs: 'paletteSave',
            windowClass: 'paletteSaveModal',
            resolve: {
                data: function () {
                    return msg;
                }
            }
        });
    };

    return self;
}]);