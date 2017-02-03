/*

    The Color Blindness Simulation function is
    copyright (c) 2000-2001 by Matthew Wickline and the
    Human-Computer Interaction Resource Network ( http://hcirn.com/ ).
    
    It is used with the permission of Matthew Wickline and HCIRN,
    and is freely available for non-commercial use. For commercial use, please
    contact the Human-Computer Interaction Resource Network ( http://hcirn.com/ ).

	------------------------
	blind.protan =
		cpu = 0.735; // confusion point, u coord
		cpv = 0.265; // confusion point, v coord
		abu = 0.115807; // color axis begining point (473nm), u coord
		abv = 0.073581; // color axis begining point (473nm), v coord
		aeu = 0.471899; // color axis ending point (574nm), u coord
		aev = 0.527051; // color axis ending point (574nm), v coord
	blind.deutan =
		cpu =  1.14; // confusion point, u coord
		cpv = -0.14; // confusion point, v coord
		abu = 0.102776; // color axis begining point (477nm), u coord
		abv = 0.102864; // color axis begining point (477nm), v coord
		aeu = 0.505845; // color axis ending point (579nm), u coord
		aev = 0.493211; // color axis ending point (579nm), v coord
	blind.tritan =
		cpu =  0.171; // confusion point, u coord
		cpv = -0.003; // confusion point, v coord
		abu = 0.045391; // color axis begining point (490nm), u coord
		abv = 0.294976; // color axis begining point (490nm), v coord
		aeu = 0.665764; // color axis ending point (610nm), u coord
		aev = 0.334011; // color axis ending point (610nm), v coord
			
	m = (aev - abv) / (aeu - abu); // slope of color axis
	yi = blind[t].abv - blind[t].abu * blind[t].m; // "y-intercept" of axis (on the "v" axis at u=0)

*/

if (typeof (Color) == "undefined") Color = {};
if (typeof (Color.Blind) == "undefined") Color.Blind = {};

var blinder = { // xy: coordinates, m: slope, yi: y-intercept
    protan: {
        x: 0.7465,
        y: 0.2535,
        m: 1.273463,
        yi: -0.073894
    },
    deutan: {
        x: 1.4,
        y: -0.4,
        m: 0.968437,
        yi: 0.003331
    },
    tritan: {
        x: 0.1748,
        y: 0,
        m: 0.062921,
        yi: 0.292119
    },
    custom: {
        x: 0.735,
        y: 0.265,
        m: -1.059259,
        yi: 1.026914
    }
};

Color.Blind = function (rgb, type, anomalize) {
    if (type === "achroma") { // D65 in sRGB
        var z = rgb.R * 0.212656 + rgb.G * 0.715158 + rgb.B * 0.072186;
        var z = { R: z, G: z, B: z };
        if (anomalize) {
            var v = 1.75;
            var n = v + 1;
            z.R = (v * z.R + rgb.R) / n;
            z.G = (v * z.G + rgb.G) / n;
            z.B = (v * z.B + rgb.B) / n;
        }
        return z;
    }
    var line = blinder[type];
    var c = Color.Space.XYZ_xyY(Color.Space.RGB_XYZ(rgb));
    // The confusion line is between the source color and the confusion point
    var slope = (c.y - line.y) / (c.x - line.x);
    var yi = c.y - c.x * slope; // slope, and y-intercept (at x=0)
    // Find the change in the x and y dimensions (no Y change)
    dx = (line.yi - yi) / (slope - line.m);
    dy = (slope * dx) + yi;
    dY = 0;
    // Find the simulated colors XYZ coords
    var z = {};
    z.X = dx * c.Y / dy;
    z.Y = c.Y;
    z.Z = (1 - (dx + dy)) * c.Y / dy;
    // Calculate difference between sim color and neutral color
    var ngx = 0.312713 * c.Y / 0.329016; // find neutral grey using D65 white-point
    var ngz = 0.358271 * c.Y / 0.329016;
    dX = ngx - z.X;
    dZ = ngz - z.Z;
    // find out how much to shift sim color toward neutral to fit in RGB space
    var M = Color.Space.XYZ_RGB_Matrix;
    dR = dX * M[0] + dY * M[3] + dZ * M[6]; // convert d to linear RGB
    dG = dX * M[1] + dY * M[4] + dZ * M[7];
    dB = dX * M[2] + dY * M[5] + dZ * M[8];
    z.R = z.X * M[0] + z.Y * M[3] + z.Z * M[6]; // convert z to linear RGB
    z.G = z.X * M[1] + z.Y * M[4] + z.Z * M[7];
    z.B = z.X * M[2] + z.Y * M[5] + z.Z * M[8];
    var _r = ((z.R < 0 ? 0 : 1) - z.R) / dR;
    var _g = ((z.G < 0 ? 0 : 1) - z.G) / dG;
    var _b = ((z.B < 0 ? 0 : 1) - z.B) / dB;
    _r = (_r > 1 || _r < 0) ? 0 : _r;
    _g = (_g > 1 || _g < 0) ? 0 : _g;
    _b = (_b > 1 || _b < 0) ? 0 : _b;
    var adjust = _r > _g ? _r : _g;
    if (_b > adjust) adjust = _b;
    // shift proportionally...
    z.R += adjust * dR;
    z.G += adjust * dG;
    z.B += adjust * dB;
    // apply gamma and clamp simulated color...
    z.R = 255 * (z.R <= 0 ? 0 : z.R >= 1 ? 1 : Math.pow(z.R, 1 / Color.Space.Gamma));
    z.G = 255 * (z.G <= 0 ? 0 : z.G >= 1 ? 1 : Math.pow(z.G, 1 / Color.Space.Gamma));
    z.B = 255 * (z.B <= 0 ? 0 : z.B >= 1 ? 1 : Math.pow(z.B, 1 / Color.Space.Gamma));
    //
    if (anomalize) {
        var v = 1.75;
        var n = v + 1;
        z.R = (v * z.R + rgb.R) / n;
        z.G = (v * z.G + rgb.G) / n;
        z.B = (v * z.B + rgb.B) / n;
    }
    //
    return z;
};