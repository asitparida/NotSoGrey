/* 

	Color Space : v1.3 : 2011.05.20
	--------------------------------
	RGB <-> XYZ <-> xyY
			XYZ <-> Luv <-> LCHuv
			XYZ <-> Lab <-> LCHab
			XYZ <-> HLab
	RGB <-> HSL <-> W3_HSL
				<-> W3_HSLA
	RGB <-> HSV <-> RYB
	RGB <-> HSI
	RGB <-> CMY <-> CMYK
	RGB <-> HEX <-> STRING
	RGB <-> W3_RGB
	RGB <-> W3_RGBA
	RGB <-> W3_HEX
	RGB <-> HEX24
	RGB <-> HEX32
	
	International Color Consortium (ICC) Profiles
	----------------------------------------------
	Adobe (1998)
	Apple RGB
	BestRGB
	Beta RGB
	Bruce RGB
	CIE RGB
	ColorMatch
	DonRGB4
	Ekta Space PS5
	Generic RGB
	HDTV (HD-CIF)
	NTSC
	PAL / SECAM
	ProPhoto
	SGI
	SMPTE-240M
	SMPTE-C
	Wide Gamut
	eciRGB
	sRGB
	
	White Points of Standard Illuminants
	-------------------------------------
	A: 2856k // Incandescent tungsten
	B: 4874k // Obsolete, direct sunlight at noon 
	C: 6774k // Obsolete, north sky daylight 
	D50: 5003k // ICC Profile PCS. Horizon light. 
	D55: 5503k // Compromise between incandescent and daylight
	D65: 6504k // Daylight, sRGB color space 
	D75: 7504k // North sky day light
	E: 5454k // Equal energy 
	F1: 6430k // Daylight Fluorescent 
	F2: 4230k // Cool White Fluorescent 
	F3: 3450k // White Fluorescent 
	F4: 2940k // Warm White Fluorescent 
	F5: 6350k // Daylight Fluorescent 
	F6: 4150k // Lite White Fluorescent
	F7: 6500k // D65 simulator, day light simulator 
	F8: 5000k // D50 simulator, Sylvania F40 Design 
	F9: 4150k // Cool White Deluxe Fluorescent 
	F10: 5000k // Philips TL85, Ultralume 50 
	F11: 4000k // Philips TL84, Ultralume 40 
	F12: 3000k // Philips TL83, Ultralume 30

*/

if (typeof (Color) == "undefined") Color = {};
if (typeof (Color.Space) == "undefined") Color.Space = {};

var DEG_RAD = Math.PI / 180;
var RAD_DEG = 1 / DEG_RAD;

var functions = {};
var shortcuts = {
    "RGB>STRING": "RGB>HEX>STRING",
    "STRING>RGB": "STRING>HEX>RGB"
};

var root = Color.Space = function (color, route) {
    if (shortcuts[route]) { // shortcut available
        route = shortcuts[route];
    }
    if (functions[route]) { // cached function available
        return functions[route](color);
    }
    var r = route.split(">");
    // check whether color is an [], if so, convert to {}
    if (typeof (color) == "object" && color[0] >= 0) {
        var type = key.split("_")[0];
        var tmp = {};
        for (var i = 0; i < type.length; i++) {
            var str = type.substr(i, 1);
            tmp[str] = color[i];
        }
        color = tmp;
    }
    var f = "color";
    for (var pos = 1, key = r[0]; pos < r.length; pos++) {
        if (pos > 1) { // recycle previous
            key = key.substr(key.indexOf("_") + 1);
        }
        key += (pos == 0 ? "" : "_") + r[pos];
        color = root[key](color);
        f = "Color.Space." + key + "(" + f + ")";
    }
    functions[route] = eval("(function(color) { return " + f + " })");
    return color;
};

root.RGB_W3RGBA =
root.RGBA_W3RGBA = function (o) {
    var alpha = typeof (o.A) == "number" ? o.A : 1;
    return 'rgba(' + (o.R >> 0) + ',' + (o.G >> 0) + ',' + (o.B >> 0) + ',' + alpha + ')';
};

root.RYB_Hue = function (hue) {
    var n = hue >> 0;
    var x = n > 0 ? hue % n : 0;
    var a = RYB_Hue_Table[n % 360];
    var b = RYB_Hue_Table[((hue + 1) >> 0) % 360];
    if (b < a) b = 360;
    return a + (b - a) * x;
};

root.Hue_RYB = function (hue) {
    var n = hue >> 0;
    var x = n > 0 ? hue % n : 0;
    var a = Hue_RYB_Table[n % 360];
    var b = Hue_RYB_Table[((hue + 1) >> 0) % 360];
    if (b < a) b = 360;
    return a + (b - a) * x;
};

// STRING = 'FFFFFF' | 'FFFFFFFF'

root.STRING_HEX = function (o) {
    return parseInt('0x' + o);
};

root.STRING_HEX32 = function (o) {
    if (o.length === 6) {
        return parseInt('0xFF' + o);
    } else {
        return parseInt('0x' + o);
    }
};

// HEX = 0x000000 -> 0xFFFFFF

root.HEX_STRING = function (o, maxLength) {
    if (!maxLength) maxLength = 6;
    if (!o) o = 0;
    var z = o.toString(16);
    // when string is lesser than maxLength
    var n = z.length;
    while (n < maxLength) {
        z = '0' + z;
        n++;
    }
    // when string is greater than maxLength
    var n = z.length;
    while (n > maxLength) {
        z = z.substr(1);
        n--;
    }
    return z;
};

root.HEX32_STRING = function (o) {
    return root.HEX_STRING(o, 8);
};

root.HEX_RGB = function (o) {
    return {
        R: (o >> 16),
        G: (o >> 8) & 0xFF,
        B: o & 0xFF
    };
};

// HEX32 = 0x00000000 -> 0xFFFFFFFF

root.HEX32_RGBA = function (o) {
    return {
        R: o >>> 16 & 0xFF,
        G: o >>> 8 & 0xFF,
        B: o & 0xFF,
        A: o >>> 24
    };
};

// RGBA = R: Red / G: Green / B: Blue / A: Alpha

root.RGBA_HEX32 = function (o) {
    return (o.A << 24 | o.R << 16 | o.G << 8 | o.B) >>> 0;
};

// RGB = R: Red / G: Green / B: Blue

root.RGB_HEX = function (o) {
    if (o.R < 0) o.R = 0;
    if (o.G < 0) o.G = 0;
    if (o.B < 0) o.B = 0;
    if (o.R > 255) o.R = 255;
    if (o.G > 255) o.G = 255;
    if (o.B > 255) o.B = 255;
    return o.R << 16 | o.G << 8 | o.B;
};

root.RGB_CMY = function (o) {
    return {
        C: 1 - (o.R / 255),
        M: 1 - (o.G / 255),
        Y: 1 - (o.B / 255)
    };
};

root.RGB_HSL = function (o) { // RGB from 0 to 1
    var _R = o.R / 255,
        _G = o.G / 255,
        _B = o.B / 255,
        min = Math.min(_R, _G, _B),
        max = Math.max(_R, _G, _B),
        D = max - min,
        H,
        S,
        L = (max + min) / 2;
    if (D == 0) { // No chroma
        H = 0;
        S = 0;
    } else { // Chromatic data
        if (L < 0.5) S = D / (max + min);
        else S = D / (2 - max - min);
        var DR = (((max - _R) / 6) + (D / 2)) / D;
        var DG = (((max - _G) / 6) + (D / 2)) / D;
        var DB = (((max - _B) / 6) + (D / 2)) / D;
        if (_R == max) H = DB - DG;
        else if (_G == max) H = (1 / 3) + DR - DB;
        else if (_B == max) H = (2 / 3) + DG - DR;
        if (H < 0) H += 1;
        if (H > 1) H -= 1;
    }
    return {
        H: H * 360,
        S: S * 100,
        L: L * 100
    };
};

root.RGB_HSV = function (o) { //- RGB from 0 to 255
    var _R = o.R / 255,
        _G = o.G / 255,
        _B = o.B / 255,
        min = Math.min(_R, _G, _B),
        max = Math.max(_R, _G, _B),
        D = max - min,
        H,
        S,
        V = max;
    if (D == 0) { // No chroma
        H = 0;
        S = 0;
    } else { // Chromatic data
        S = D / max;
        var DR = (((max - _R) / 6) + (D / 2)) / D;
        var DG = (((max - _G) / 6) + (D / 2)) / D;
        var DB = (((max - _B) / 6) + (D / 2)) / D;
        if (_R == max) H = DB - DG;
        else if (_G == max) H = (1 / 3) + DR - DB;
        else if (_B == max) H = (2 / 3) + DG - DR;
        if (H < 0) H += 1;
        if (H > 1) H -= 1;
    }
    return {
        H: H * 360,
        S: S * 100,
        V: V * 100
    };
};

root.RGB_XYZ = function (o) {
    if (!root.RGB_XYZ_Matrix) root.getProfile('sRGB');
    var M = root.RGB_XYZ_Matrix;
    var z = {};
    var R = o.R / 255;
    var G = o.G / 255;
    var B = o.B / 255;
    if (root.Profile == 'sRGB') {
        R = (R > 0.04045) ? Math.pow(((R + 0.055) / 1.055), 2.4) : R / 12.92;
        G = (G > 0.04045) ? Math.pow(((G + 0.055) / 1.055), 2.4) : G / 12.92;
        B = (B > 0.04045) ? Math.pow(((B + 0.055) / 1.055), 2.4) : B / 12.92;
    } else {
        R = Math.pow(R, root.Gamma);
        G = Math.pow(G, root.Gamma);
        B = Math.pow(B, root.Gamma);
    }
    z.X = R * M[0] + G * M[3] + B * M[6];
    z.Y = R * M[1] + G * M[4] + B * M[7];
    z.Z = R * M[2] + G * M[5] + B * M[8];
    return z;
};

// CMY = C: Cyan / M: Magenta / Y: Yellow

root.CMY_RGB = function (o) {
    var r = (1 - o.C) * 255;
    var g = (1 - o.M) * 255;
    var b = (1 - o.Y) * 255;
    return {
        R: r < 0 ? 0 : r,
        G: g < 0 ? 0 : g,
        B: b < 0 ? 0 : b
    };
};

root.CMY_CMYK = function (o) {
    var C = o.C;
    var M = o.M;
    var Y = o.Y;
    var K = Math.min(Y, M, C, 1);
    C = (C - K) / (1 - K) * 100 + 0.5 >> 0;
    M = (M - K) / (1 - K) * 100 + 0.5 >> 0;
    Y = (Y - K) / (1 - K) * 100 + 0.5 >> 0;
    K = K * 100 + 0.5 >> 0;
    return {
        C: C,
        M: M,
        Y: Y,
        K: K
    };
};

// CMYK = C: Cyan / M: Magenta / Y: Yellow / K: Key (black)

root.CMYK_CMY = function (o) {
    return {
        C: (o.C * (1 - o.K) + o.K),
        M: (o.M * (1 - o.K) + o.K),
        Y: (o.Y * (1 - o.K) + o.K)
    };
};

// HSL (1978) = H: Hue / S: Saturation / L: Lightess
// en.wikipedia.org/wiki/HSL_and_HSV

root.HSL_RGB = function (o) {
    var H = o.H / 360;
    var S = o.S / 100;
    var L = o.L / 100;
    var R, G, B;
    var temp1, temp2, temp3;
    if (S == 0) {
        R = G = B = L;
    } else {
        if (L < 0.5) temp2 = L * (1 + S);
        else temp2 = (L + S) - (S * L);
        temp1 = 2 * L - temp2;
        // calculate red
        temp3 = H + (1 / 3);
        if (temp3 < 0) temp3 += 1;
        if (temp3 > 1) temp3 -= 1;
        if ((6 * temp3) < 1) R = temp1 + (temp2 - temp1) * 6 * temp3;
        else if ((2 * temp3) < 1) R = temp2;
        else if ((3 * temp3) < 2) R = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
        else R = temp1;
        // calculate green
        temp3 = H;
        if (temp3 < 0) temp3 += 1;
        if (temp3 > 1) temp3 -= 1;
        if ((6 * temp3) < 1) G = temp1 + (temp2 - temp1) * 6 * temp3;
        else if ((2 * temp3) < 1) G = temp2;
        else if ((3 * temp3) < 2) G = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
        else G = temp1;
        // calculate blue
        temp3 = H - (1 / 3);
        if (temp3 < 0) temp3 += 1;
        if (temp3 > 1) temp3 -= 1;
        if ((6 * temp3) < 1) B = temp1 + (temp2 - temp1) * 6 * temp3;
        else if ((2 * temp3) < 1) B = temp2;
        else if ((3 * temp3) < 2) B = temp1 + (temp2 - temp1) * ((2 / 3) - temp3) * 6;
        else B = temp1;
    }
    return {
        R: R * 255,
        G: G * 255,
        B: B * 255
    };
};

// HSV (1978) = H: Hue / S: Saturation / V: Value
// en.wikipedia.org/wiki/HSL_and_HSV

root.HSV_RGB = function (o) {
    var H = o.H / 360;
    var S = o.S / 100;
    var V = o.V / 100;
    var R, G, B;
    if (S == 0) {
        R = G = B = V * 255 + 0.5 >> 0;
    } else {
        if (H >= 1) H = 0;
        H = 6 * H;
        D = H - H >> 0;
        A = 255 * V * (1 - S) + 0.5 >> 0;
        B = 255 * V * (1 - (S * D)) + 0.5 >> 0;
        C = 255 * V * (1 - (S * (1 - D))) + 0.5 >> 0;
        V = 255 * V + 0.5 >> 0;
        switch (H >> 0) {
            case 0:
                R = V;
                G = C;
                B = A;
                break;
            case 1:
                R = B;
                G = V;
                B = A;
                break;
            case 2:
                R = A;
                G = V;
                B = C;
                break;
            case 3:
                R = A;
                G = B;
                B = V;
                break;
            case 4:
                R = C;
                G = A;
                B = V;
                break;
            case 5:
                R = V;
                G = A;
                B = B;
                break;
        }
    }
    return {
        R: R,
        G: G,
        B: B
    };
};

// CIE (Commission International de L’Eclairage)

// CIE-XYZ (1931) = Y: Luminescence / XZ: Spectral Weighting Curves (Spectral Locus)

root.XYZ_RGB = function (o) {
    if (!root.XYZ_RGB_Matrix) root.getProfile('sRGB');
    var M = root.XYZ_RGB_Matrix;
    var z = {};
    z.R = o.X * M[0] + o.Y * M[3] + o.Z * M[6];
    z.G = o.X * M[1] + o.Y * M[4] + o.Z * M[7];
    z.B = o.X * M[2] + o.Y * M[5] + o.Z * M[8];
    if (root.Profile == 'sRGB') {
        z.R = (z.R > 0.0031308) ? (1.055 * Math.pow(z.R, 1 / 2.4)) - 0.055 : 12.92 * z.R;
        z.G = (z.G > 0.0031308) ? (1.055 * Math.pow(z.G, 1 / 2.4)) - 0.055 : 12.92 * z.G;
        z.B = (z.B > 0.0031308) ? (1.055 * Math.pow(z.B, 1 / 2.4)) - 0.055 : 12.92 * z.B;
    } else {
        z.R = Math.pow(z.R, 1 / root.Gamma);
        z.G = Math.pow(z.G, 1 / root.Gamma);
        z.B = Math.pow(z.B, 1 / root.Gamma);
    }
    return {
        R: z.R * 255 + 0.5 >> 0,
        G: z.G * 255 + 0.5 >> 0,
        B: z.B * 255 + 0.5 >> 0
    };
};

root.XYZ_xyY = function (o) {
    var n = o.X + o.Y + o.Z;
    if (n == 0) {
        return {
            x: 0,
            y: 0,
            Y: o.Y
        };
    }
    return {
        x: o.X / n,
        y: o.Y / n,
        Y: o.Y
    };
};

root.XYZ_HLab = function (o) {
    var n = Math.sqrt(o.Y);
    return {
        L: 10 * n,
        a: 17.5 * (((1.02 * o.X) - o.Y) / n),
        b: 7 * ((o.Y - (0.847 * o.Z)) / n)
    };
};

root.XYZ_Lab = function (o) {
    var X = o.X / root.WPScreen.X,
        Y = o.Y / root.WPScreen.Y,
        Z = o.Z / root.WPScreen.Z;
    if (X > 0.008856) {
        X = Math.pow(X, 1 / 3);
    } else {
        X = (7.787 * X) + (16 / 116);
    }
    if (Y > 0.008856) {
        Y = Math.pow(Y, 1 / 3);
    } else {
        Y = (7.787 * Y) + (16 / 116);
    }
    if (Z > 0.008856) {
        Z = Math.pow(Z, 1 / 3);
    } else {
        Z = (7.787 * Z) + (16 / 116);
    }
    return {
        L: (116 * Y) - 16,
        a: 500 * (X - Y),
        b: 200 * (Y - Z)
    };
};

root.XYZ_Luv = function (o) {
    var r = root.WPScreen;
    var U = (4 * o.X) / (o.X + (15 * o.Y) + (3 * o.Z));
    var V = (9 * o.Y) / (o.X + (15 * o.Y) + (3 * o.Z));
    if (o.Y > 0.008856) {
        o.Y = Math.pow(o.Y, 1 / 3);
    } else {
        o.Y = (7.787 * o.Y) + (16 / 116);
    }
    var _L = (116 * o.Y) - 16;
    var _U = (4 * r.X) / (r.X + (15 * r.Y) + (3 * r.Z));
    var _V = (9 * r.Y) / (r.X + (15 * r.Y) + (3 * r.Z));
    return {
        L: _L,
        u: 13 * _L * (U - _U) || 0,
        v: 13 * _L * (V - _V) || 0
    };
};

// CIE-xyY (1931) = Y: Luminescence / xy: Chromaticity Co-ordinates (Spectral Locus)

root.xyY_XYZ = function (o) {
    return {
        X: (o.x * o.Y) / o.y,
        Y: o.Y,
        Z: ((1 - o.x - o.y) * o.Y) / o.y
    };
};

// Hunter-L*ab (1948) = L: Lightness / ab: Color-opponent Dimensions

root.HLab_XYZ = function (o) {
    var _Y = o.L / 10;
    var _X = (o.a / 17.5) * (o.L / 10);
    var _Z = (o.b / 7) * (o.L / 10);
    var Y = _Y * _Y; // power of 2
    var X = (_X + Y) / 1.02;
    var Z = -(_Z - Y) / 0.847;
    return {
        X: X,
        Y: Y,
        Z: Z
    };
};

// CIE-L*ab (1976) = L: Luminescence / a: Red / Green / b: Blue / Yellow

root.Lab_XYZ = function (o) {
    var r = root.WPScreen;
    var Y = (o.L + 16) / 116;
    var Y3 = Y * Y * Y;
    var X = o.a / 500 + Y;
    var X3 = X * X * X;
    var Z = Y - o.b / 200;
    var Z3 = Z * Z * Z;
    //
    Y = Y3 > 0.008856 ? Y3 : (Y - 16 / 116) / 7.787;
    X = X3 > 0.008856 ? X3 : (X - 16 / 116) / 7.787;
    Z = Z3 > 0.008856 ? Z3 : (Z - 16 / 116) / 7.787;
    //
    return {
        X: r.X * X,
        Y: r.Y * Y,
        Z: r.Z * Z
    };
};

root.Lab_LCHab = function (o) {
    var H = Math.atan2(o.b, o.a) * RAD_DEG;
    if (H < 0) {
        H += 360;
    } else if (H > 360) {
        H -= 360;
    }
    return {
        L: o.L,
        C: Math.sqrt(o.a * o.a + o.b * o.b),
        H: H
    };
};

// CIE-L*uv (1976) = L: Luminescence / u: Saturation / v: Hue

root.Luv_XYZ = function (o) {
    var r = root.WPScreen;
    var Y = (o.L + 16) / 116;
    var Y3 = Y * Y * Y;
    Y = (Y3 > 0.008856) ? Y3 : ((Y - 16 / 116) / 7.787);
    var _U = (4 * r.X) / (r.X + (15 * r.Y) + (3 * r.Z));
    var _V = (9 * r.Y) / (r.X + (15 * r.Y) + (3 * r.Z));
    //
    var U = o.u / (13 * o.L) + _U;
    var V = o.v / (13 * o.L) + _V;
    //
    var X = -(9 * Y * U) / ((U - 4) * V - U * V);
    var Z = (9 * Y - (15 * V * Y) - (V * X)) / (3 * V);
    //
    return {
        X: X,
        Y: Y,
        Z: Z
    };
};

root.Luv_LCHuv = function (o) {
    var H = Math.atan2(o.v, o.u) * RAD_DEG;
    if (H < 0) {
        H += 360;
    } else if (H > 360) {
        H -= 360;
    }
    return {
        L: o.L,
        C: Math.sqrt(o.u * o.u + o.v * o.v),
        H: H
    };
};

// CIE-L*CH (1986) = L: Luminescece / C: Chromacity / H: Hue

root.LCHab_Lab = function (o) {
    var rad = o.H * DEG_RAD;
    return {
        L: o.L,
        a: Math.cos(rad) * o.C,
        b: Math.sin(rad) * o.C
    };
};

root.LCHuv_Luv = function (o) {
    var rad = o.H * DEG_RAD;
    return {
        L: o.L,
        u: Math.cos(rad) * o.C,
        v: Math.sin(rad) * o.C
    }
};

// HSI (1976) = H: Hue / S: Saturation / I: Intensity
//// Derivation of HIS-to-RGB and RGB-to-HSI Conversion Equations (Gonzalez and Woods, 1992)
// - http://turing.iimas.unam.mx/~elena/CompVis/hsi-to-rgb-conversion.pdf
//// Color Image Segmentation: Advances & Prospects (Cheng et. all, 2001)
// - http://digital.cs.usu.edu/~cheng/paper.ps

root.RGB_HSI = function (o) {
    var R = o.R;
    var G = o.G;
    var B = o.B;
    var alpha = 0.5 * (2 * R - G - B);
    var beta = Math.sqrt(3) * (G - B);
    I = (R + G + B) / 3;
    if (I > 0) {
        S = 1 - Math.min(R, G, B) / I;
        H = Math.atan2(beta, alpha) * RAD_DEG;
        if (H < 0) {
            H += 360;
        }
    } else { // zero intensity
        H = S = 0;
    }
    return {
        H: H,
        S: S * 100,
        I: I
    }
};

root.HSI_RGB = function (o) {
    var H = o.H;
    var S = o.S / 100;
    var I = o.I;
    var R, G, B;
    H -= 360 * (H / 360 >> 0);
    if (H < 120) {
        B = I * (1 - S);
        R = I * (1 + S * Math.cos(H * DEG_RAD) / Math.cos((60 - H) * DEG_RAD));
        G = 3 * I - R - B;
    } else if (H < 240) {
        H -= 120;
        R = I * (1 - S);
        G = I * (1 + S * Math.cos(H * DEG_RAD) / Math.cos((60 - H) * DEG_RAD));
        B = 3 * I - R - G;
    } else {
        H -= 240;
        G = I * (1 - S);
        B = I * (1 + S * Math.cos(H * DEG_RAD) / Math.cos((60 - H) * DEG_RAD));
        R = 3 * I - G - B;
    }
    return {
        R: R,
        G: G,
        B: B
    };
};

// Chromatic Adaption
//// Bruce Lindbloom (2009)
// - http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html

root.getAdaption = function (XYZ, method) {
    var r = { // Adaption methods
        'XYZ scaling': {
            A: [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ],
            Z: [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1]
            ]
        },
        'Von Kries': {
            A: [
                [0.400240, -0.226300, 0],
                [0.707600, 1.165320, 0],
                [-0.080810, 0.045700, 0.918220]
            ],
            Z: [
                [1.859936, 0.361191, 0],
                [-1.129382, 0.638812, 0],
                [0.219897, -0.000006, 1.089064]
            ]
        },
        'Bradford': {
            A: [
                [0.895100, 0.26640000, -0.16139900],
                [-0.75019900, 1.71350, 0.0367000],
                [0.03889900, -0.0685000, 1.02960000]
            ],
            Z: [
                [0.986993, -0.14705399, 0.15996299],
                [0.43230499, 0.51836, 0.0492912],
                [-0.00852866, 0.0400428, 0.96848699]
            ]
        }
    };
    var WS = root.WPSource; // White Point Source
    var WD = root.WPScreen; // White Point Destination
    var A = r[method].A; // Load Matrices
    var Z = r[method].Z;
    // Convert to cone responce domain
    var CRD = multiply(A, [
        [WD.X],
        [WD.Y],
        [WD.Z]
    ]);
    var CRS = multiply(A, [
        [WS.X],
        [WS.Y],
        [WS.Z]
    ]);
    // Scale Vectors
    var M = [
        [CRD[0] / CRS[0], 0, 0],
        [0, CRD[1] / CRS[1], 0],
        [0, 0, CRD[2] / CRS[2]]
    ];
    // Back to XYZ
    var z = multiply(Z, multiply(M, multiply(A, [
        [XYZ.X],
        [XYZ.Y],
        [XYZ.Z]
    ])));
    return {
        X: z[0][0],
        Y: z[1][0],
        Z: z[2][0]
    };
};

// Generate XYZ <-> RGB matrices

root.getProfile = function (i) {
    var profile = ICC_Profiles[i];
    root.Profile = i;
    root.ICCProfile = profile;
    root.Gamma = profile[0];
    root.WPSource = root.getIlluminant('2', profile[1]);
    function adapt(color) {
        return root.getAdaption(root.xyY_XYZ(color), 'Bradford');
    };
    var R = adapt({
        x: profile[2],
        y: profile[3],
        Y: profile[4]
    });
    var G = adapt({
        x: profile[5],
        y: profile[6],
        Y: profile[7]
    });
    var B = adapt({
        x: profile[8],
        y: profile[9],
        Y: profile[10]
    });
    root.RGB_XYZ_Matrix = [R.X, R.Y, R.Z, G.X, G.Y, G.Z, B.X, B.Y, B.Z];
    root.XYZ_RGB_Matrix = inverse(root.RGB_XYZ_Matrix);
};

// Convert illuminant into spectral weighting Curves

root.getIlluminant = function (observer, type) {
    var color = Std_Illuminants[type];
    if (observer == "2") {
        color = {
            x: color[0],
            y: color[1],
            Y: 1
        };
    } else {
        color = {
            x: color[2],
            y: color[3],
            Y: 1
        };
    }
    return root.xyY_XYZ(color);
};

// RYB (1961) = R: Red / Y: Yellow / B: Blue

var RYB_Hue_Table = []; // LookupTables for Painters Palette
var Hue_RYB_Table = [];

(function () { // Farbkreis by Johannes Itten [via NodeBox]
    var wheel = [
        [0, 0], [15, 8], // Red
        [30, 17], [45, 26], // Orange
        [60, 34], [75, 41], // Yellow
        [90, 48], [105, 54], // Lime
        [120, 60], [135, 81], // Green
        [150, 103], [165, 123], // Teal
        [180, 138], [195, 155], // Cyan
        [210, 171], [225, 187], // Azure
        [240, 204], [255, 219], // Blue
        [270, 234], [285, 251], // Indigo
        [300, 267], [315, 282], // Purple
        [330, 298], [345, 329], // Pink
        [360, 0]
    ];
    // populate lookup-tables
    for (var hue = 0; hue < 360; hue++) {
        var greaterThan = false;
        var lessThan = false;
        for (var i = 0; i < 24; i++) {
            var pointA = wheel[i];
            var pointB = wheel[i + 1];
            if (pointB && pointB[1] < pointA[1]) { //
                pointB[1] += 360;
            }
            if (!greaterThan && pointA[0] <= hue && pointB[0] > hue) { //
                Hue_RYB_Table[hue] = (pointA[1] + (pointB[1] - pointA[1]) * (hue - pointA[0]) / (pointB[0] - pointA[0])) % 360;
                greaterThan = true;
            }
            if (!lessThan && pointA[1] <= hue && pointB[1] > hue) { // 
                RYB_Hue_Table[hue] = (pointA[0] + (pointB[0] - pointA[0]) * (hue - pointA[1]) / (pointB[1] - pointA[1])) % 360;
                lessThan = true;
            }
            if (greaterThan == true && lessThan == true) break;
        }
    }
})();

// International Color Consortium (ICC) Profiles
//// Bruce Lindbloom (2011)
// - http://brucelindbloom.com/index.html?WorkingSpaceInfo.html

var ICC_Profiles = { // [ Gamma, Illuminant, Matrix ]

    'Adobe (1998)': [2.2, 'D65', 0.64, 0.33, 0.297361, 0.21, 0.71, 0.627355, 0.15, 0.06, 0.075285], // Adobe
    'Apple RGB': [1.8, 'D65', 0.625, 0.34, 0.244634, 0.28, 0.595, 0.672034, 0.155, 0.07, 0.083332], // Apple, a.k.a. SGI
    'BestRGB': [2.2, 'D50', 0.7347, 0.2653, 0.228457, 0.215, 0.775, 0.737352, 0.13, 0.035, 0.034191], // Don Hutcheson
    'Beta RGB': [2.2, 'D50', 0.6888, 0.3112, 0.303273, 0.1986, 0.7551, 0.663786, 0.1265, 0.0352, 0.032941], // Bruce Lindbloom
    'Bruce RGB': [2.2, 'D65', 0.64, 0.33, 0.240995, 0.28, 0.65, 0.683554, 0.15, 0.06, 0.075452], // Bruce Fraser
    'CIE RGB': [2.2, 'E', 0.735, 0.265, 0.176204, 0.274, 0.717, 0.812985, 0.167, 0.009, 0.010811], // CIE
    'ColorMatch': [1.8, 'D50', 0.63, 0.34, 0.274884, 0.295, 0.605, 0.658132, 0.15, 0.075, 0.066985], // Radius
    'DonRGB4': [2.2, 'D50', 0.696, 0.3, 0.27835, 0.215, 0.765, 0.68797, 0.13, 0.035, 0.03368],
    'eciRGB': [1.8, 'D50', 0.67, 0.33, 0.32025, 0.21, 0.71, 0.602071, 0.14, 0.08, 0.077679], // European Colour Initiative
    'Ekta Space PS5': [2.2, 'D50', 0.695, 0.305, 0.260629, 0.26, 0.7, 0.734946, 0.11, 0.005, 0.004425], // Joseph Holmes
    'Generic RGB': [1.8, 'D65', 0.6295, 0.3407, 0.232546, 0.2949, 0.6055, 0.672501, 0.1551, 0.0762, 0.094952],
    'HDTV (HD-CIF)': [1.95, 'D65', 0.64, 0.33, 0.212673, 0.3, 0.6, 0.715152, 0.15, 0.06, 0.072175], // a.k.a. ITU-R BT.701
    'NTSC': [2.2, 'C', 0.67, 0.33, 0.298839, 0.21, 0.71, 0.586811, 0.14, 0.08, 0.11435], // National Television System Committee (NTSC), a.k.a. Y'I'Q'
    'PAL / SECAM': [2.2, 'D65', 0.64, 0.33, 0.222021, 0.29, 0.6, 0.706645, 0.15, 0.06, 0.071334], // European Broadcasting Union (EBU), a.k.a. Y'U'V'
    'ProPhoto': [1.8, 'D50', 0.7347, 0.2653, 0.28804, 0.1596, 0.8404, 0.711874, 0.0366, 0.0001, 0.000086], // Kodak, a.k.a. ROMM RGB
    'SGI': [1.47, 'D65', 0.625, 0.34, 0.244651, 0.28, 0.595, 0.672030, 0.155, 0.07, 0.083319],
    'SMPTE-240M': [1.92, 'D65', 0.63, 0.34, 0.212413, 0.31, 0.595, 0.701044, 0.155, 0.07, 0.086543],
    'SMPTE-C': [2.2, 'D65', 0.63, 0.34, 0.212395, 0.31, 0.595, 0.701049, 0.155, 0.07, 0.086556], // Society of Motion Picture and Television Engineers (SMPTE)
    'sRGB': [2.2, 'D65', 0.64, 0.33, 0.212656, 0.3, 0.6, 0.715158, 0.15, 0.06, 0.072186], // Microsoft & Hewlett - Packard
    'Wide Gamut': [2.2, 'D50', 0.7347, 0.2653, 0.258187, 0.1152, 0.8264, 0.724938, 0.1566, 0.0177, 0.016875]
}; // Adobe

// White Points of Standard Illuminants (CIE-1931 2° / CIE-1964 10°)
//// Wikipedia (2011)
// - http://en.wikipedia.org/wiki/Standard_illuminant

var Std_Illuminants = { // [ x2°, y2°, x10°, y10°, CCT (Kelvin) ]

    'A': [0.44757, 0.40745, 0.45117, 0.40594, 2856],  // Incandescent tungsten
    'B': [0.34842, 0.35161, 0.3498, 0.3527, 4874],  // Obsolete, direct sunlight at noon 
    'C': [0.31006, 0.31616, 0.31039, 0.31905, 6774],  // Obsolete, north sky daylight 
    'D50': [0.34567, 0.35850, 0.34773, 0.35952, 5003],  // ICC Profile PCS. Horizon light. 
    'D55': [0.33242, 0.34743, 0.33411, 0.34877, 5503],  // Compromise between incandescent and daylight
    'D65': [0.31271, 0.32902, 0.31382, 0.33100, 6504],  // Daylight, sRGB color space 
    'D75': [0.29902, 0.31485, 0.29968, 0.31740, 7504],  // North sky day light
    'E': [1 / 3, 1 / 3, 1 / 3, 1 / 3, 5454],  // Equal energy 
    'F1': [0.31310, 0.33727, 0.31811, 0.33559, 6430],  // Daylight Fluorescent 
    'F2': [0.37208, 0.37529, 0.37925, 0.36733, 4230],  // Cool White Fluorescent 
    'F3': [0.40910, 0.39430, 0.41761, 0.38324, 3450],  // White Fluorescent 
    'F4': [0.44018, 0.40329, 0.44920, 0.39074, 2940],  // Warm White Fluorescent 
    'F5': [0.31379, 0.34531, 0.31975, 0.34246, 6350],  // Daylight Fluorescent 
    'F6': [0.37790, 0.38835, 0.38660, 0.37847, 4150],  // Lite White Fluorescent
    'F7': [0.31292, 0.32933, 0.31569, 0.32960, 6500],  // D65 simulator, day light simulator 
    'F8': [0.34588, 0.35875, 0.34902, 0.35939, 5000],  // D50 simulator, Sylvania F40 Design 
    'F9': [0.37417, 0.37281, 0.37829, 0.37045, 4150],  // Cool White Deluxe Fluorescent 
    'F10': [0.34609, 0.35986, 0.35090, 0.35444, 5000],  // Philips TL85, Ultralume 50 
    'F11': [0.38052, 0.37713, 0.38541, 0.37123, 4000],  // Philips TL84, Ultralume 40 
    'F12': [0.43695, 0.40441, 0.44256, 0.39717, 3000]
}; // Philips TL83, Ultralume 30

// Output illuminant

root.Profile = "RGB"; // current working color-space
root.RGB_XYZ_Matrix = ""; // RGB->XYZ conversion matrix
root.XYZ_RGB_Matrix = ""; // XYZ->RGB conversion matrix 
root.Gamma = ""; // used in conversion process
root.WPScreen = root.getIlluminant('2', 'D65'); // screen-white point

// Matrix Math

var multiply = function (m1, m2) {
    var ni = m1.length, ki = ni, i, nj, kj = m2[0].length, j;
    var cols = m1[0].length, M = [], sum, nc, c;
    do {
        i = ki - ni;
        M[i] = [];
        nj = kj;
        do {
            j = kj - nj;
            sum = 0;
            nc = cols;
            do {
                c = cols - nc;
                sum += m1[i][c] * m2[c][j];
            } while (--nc);
            M[i][j] = sum;
        } while (--nj);
    } while (--ni);
    return M;
};

var determinant = function (m) { // 3x3
    return m[0] * (m[4] * m[8] - m[5] * m[7]) -
           m[1] * (m[3] * m[8] - m[5] * m[6]) +
           m[2] * (m[3] * m[7] - m[4] * m[6]);
};

var inverse = function (m) { // 3x3
    var d = 1.0 / determinant(m);
    return [
        d * (m[4] * m[8] - m[5] * m[7]), // 1-3
        d * (-1 * (m[1] * m[8] - m[2] * m[7])),
        d * (m[1] * m[5] - m[2] * m[4]),
        d * (-1 * (m[3] * m[8] - m[5] * m[6])), // 4-6
        d * (m[0] * m[8] - m[2] * m[6]),
        d * (-1 * (m[0] * m[5] - m[2] * m[3])),
        d * (m[3] * m[7] - m[4] * m[6]), // 7-9
        d * (-1 * (m[0] * m[7] - m[1] * m[6])),
        d * (m[0] * m[4] - m[1] * m[3])
    ];
};
/*

	Interface
	----------
	// direct access (uses root color object)
	var color = Color.HEX_RGB(0xFF00000); // returns RGB object
	var color = Color.RGB_HEX([ 255, 0, 0 ]); // returns HEX24
	var color = Color.RGB_HEX({ R: 255, G: 0, B: 0 }); 
	// or multiple color objects...
	var color = new Color("00F"); // hex color-space
	var color = new Color("0000FF");
	var color = new Color(0x0000FF);
	var color = new Color(0x0000FFFF);
	var color = new Color([0, 0, 255]); // rgb color-space
	var color = new Color([0, 0, 255, 0.5]);
	var color = new Color({ R: 0, G: 0, B: 255 });
	var color = new Color({ R: 0, G: 0, B: 255 }); 
	var color = new Color({ L: -19, a: 1.99, b: 10 }); // Lab color-space
	// specify the ICC Color Profile and Illuminant
	var color = new Color({ R: 0, G: 0, B: 255 }, {
		illuminant: "D65",
		profile: "sRGB"
	});
	// access your color object directly;
	color.R = 255;
	color.G = 87;
	color.B = 0;
	// or use the build in prototyped functions
	color.toLuv();
	color.toW3RGB();

*/

/*

Color = function(color, config) {
	function fail() { return "invalid format"; }
	if (!config) config = {};
	if (typeOf(config) == "string") {
		config.space = config;
	}
	if (config.space) {
		this.space = config.space;
		if (typeOf(color[0])=="number") {
			for (var n = 0, tmp = {}; n < color.length; n ++) {
				tmp[this.space[n]] = color[n];
			}
			this[this.space] = tmp;
		} else {
			this[this.space] = color;
		}
	} else { // 
		this.space = "RGB";
		if (typeOf(color) == "string") { // HEX string
			if (color.length == 3) { // 24-bit
				this.STRING = color[0]+""+color[0]+""+color[1]+""+color[1]+""+color[2]+""+color[2];
				this.HEX = parseInt("0x"+this.STRING);
				this.HEX_RGB();
			} else if (color.length == 6) { // 24-bit
				this.STRING = color;
				this.HEX = parseInt("0x"+color);
				this.HEX_RGB();
			} else if (color.length == 8) { // 32-bit
				var hex = color.substr(2);
				this.STRING = hex;
				this.HEX = parseInt("0x"+hex);
				this.alpha = parseInt("0x"+color.substr(2)) / 255;
				this.HEX32_RGB();
			} else {
				return fail();
			}
		} else if (typeOf(color) == "number") { // HEX number
			if (color < 0x01000000) { // 24-bit
				this.HEX = color;
				this.HEX_RGB();
			} else if (color < 0x0100000000) { // 32-bit
				this.HEX = color >>> 16 + color >>> 8 + color;
				this.alpha = color >>> 24 / 255;
				this.HEX_RGB();				
			} else {
				return fail();
			}		
		} else if (color.length == 3) { // RGB array
			this.RGB = {
				R: color[0],
				G: color[1],
				B: color[2]
			};
		} else if (color.length == 4) { // RGBA array
			this.RGB = {
				R: color[0],
				G: color[1],
				B: color[2]
			};
			this.alpha = color[3];
		} else { // object
			for (var key in colorFormats) { // letters might be mixed up... so...
				var bool = true;
				var format = colorForamts[key];
				for (var key in color) { // must match all keys
					if (!format.indexOf(key)) {
						bool = false;
						break;
					}
				}
				if (bool == true) { // got a match!
					this.space = format;
					this.toRGB();
					break;
				}
			}
			if (!this.space) {
				return fail();
			}
		}
	}
	if (config.getIlluminant) this.getIlluminant(config.getIlluminant);
	if (config.getProfile) this.getIlluminant(config.getProfile);
	return this;
};

	Color Space Conversion Routes
	------------------------------
	RGB <-> XYZ <-> xyY
			XYZ <-> Luv <-> LCHuv
			XYZ <-> Lab <-> LCHab
			XYZ <-> HLab
	RGB <-> HSL <-> W3_HSL
				<-> W3_HSLA
	RGB <-> HSV <-> RYB
	RGB <-> CMY <-> CMYK
	RGB <-> HEX <-> STRING
	RGB <-> W3_RGB
	RGB <-> W3_RGBA
	RGB <-> W3_HEX

W3 values...
-------------
em { color: rgb(255,0,0) }   
em { color: rgba(255,0,0,1)  
em { color: rgb(100%,0%,0%) }
em { color: rgba(100%,0%,0%,1) }
em { color: hsl(120, 100%, 50%) }
em { color: hsla(120, 100%, 50%, 1) } 
em { color: #000000 }

Color.prototype = {
	
	profile = function() { }, // change color profile
	whitePoint = function() {  }, // update white point
	toXYZ = function() { 
		if (this.space == "XYZ") return this.XYZ; 

	},
	toLuv = function() {
		if (isLuv) return RGB;
		return RGB.toXYZ().toLuv(); 
	},
	toLab = function() { 
		if (isLab) return RGB;
		return RGB.toXYZ().toLab(); 
	},
	toLCHuv
	toLCHab
	toXYY
	toHSL
	toHSV
	toRYB
	toCMY
	toCMYK
	toHEX32
	toHEX
	toSTRING
	toHSV = function() {
		if(this.HSV) return this.HSV;
		switch(this.space) {
			case 'RBB': return this.RGB_HSV();
			case 'XYZ': return this.XYZ_RGB().RGB_HSV();
			case 'Luv': return this.Luv_XYZ().XYZ_RGB().RGB_HSV();
			case 'LCHuv': return this.LCHuv_Luv().Luv_XYZ().XYZ_RGB().RGB_HSV();
			case 'Lab': return this.Lab_XYZ().XYZ_RGB().RGB_HSV();
			case 'LCHab': return this.LCHab_Lab().Lab_XYZ().XYZ_RGB().RGB_HSV();
			case 'XYY': return this.XYY_XYZ().XYZ_RGB().RGB_HSV();
			case 'HSL': return this.HSL_RGB().RGB_HSV();
			case 'RYB': return this.RYB_HSV();
			case 'CMY': return this.CMY_RGB().RGB_HSV();
			case 'CMYK': return this.CMYK_CMY().CMY_RGB().RGB_HSV();
			case 'HEX': return this.HEX_RGB().RGB_HSV();
		}	
	},
	toRGB = function() {
		if(this.RGB) return this.RGB;
		switch(this.space) {
			case 'XYZ': return this.XYZ_RGB();
			case 'Luv': return this.Luv_XYZ().XYZ_RGB();
			case 'LCHuv': return this.LCHuv_Luv().Luv_XYZ().XYZ_RGB();
			case 'Lab': return this.Lab_XYZ().XYZ_RGB();
			case 'LCHab': return this.LCHab_Lab().Lab_XYZ().XYZ_RGB();
			case 'XYY': return this.XYY_XYZ().XYZ_RGB();			
			case 'HSL': return this.HSL_RGB();
			case 'HSV': return this.HSV_RGB();
			case 'RYB': return this.RYB_HSV().HSV_RGB();
			case 'CMY': return this.CMY_RGB();
			case 'CMYK': return this.CMYK_CMY().CMY_RGB();
			case 'HEX': return this.HEX_RGB();
		}	
	},
	toRGB32 = function() {
	
	}
};

*/

/* 

	YCbCr (ITU - R BT.601): Luma, Chroma1, Chroma2 (Digital)
	YPbPr: Luma, Chroma1, Chroma2 (analog video) - > R: xr = 0.67 yr = 0.33 G: xg = 0.21 yg = 0.71 B: xb = 0.15 yb = 0.06
	PhotoYCC: Luminance, Chroma1, Chroma2 (Kodak)
	LCC: Luma, Chroma1, Chroma2 (LCC color coordinates are used in an intermediate calculation of the PhotoYCC color coordinates)
	
	(1905)	Munsell		Albert H. Munsell [ Munsell 1905, 1969; Graves 1951 ]
	(1916)	Ostwald		Wilhelm Ostwald [ Ostwald 1916, Evans 1948 ]
	(1947)	OSA-UCS		Judd, MacAdam, Nickerson, Newhall, Wyszecki [ MacAdam 1974, Nickerson 1977, 1979 ] - > Optical Society of America - Uniform Color Scale
	(1955)	DIN			Manfred Richter [ Richter 1955, 1986 ] - > Deutsche Industrie Nomung
	(1968)	NCS			Anders Hård & Lars Sivik [ Hard & Sivik 1981 ], Swedish Colour Centre Foundation [ Swedish 1979 ] - > Natural Colour System
	(1962)	Coloroid	Antal Nemcsics [ Nemcsics 1980, 1987 ]
	(1992)	Colorcurve	Robert Stanziola [ Stanziola 1992 ]
	(1927)	RAL			Reichsausschuß für Lieferbedingungen - > http: // www.paintcenter.org / rj / oct04hh.cfm
	(1955)	ISCC-NBS	Inter - Society - Color - Council & National Bureau of Standards
	
*/