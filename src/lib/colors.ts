export function hexToRgb(hex:string) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r:0, g:0, b:0};
}
export function maxContrast (rgb:any) {

    const flipYs = 0.342; // based on APCA™ 0.98G middle contrast BG

    const trc = 2.4, Rco = 0.2126729, Gco = 0.7151522, Bco = 0.0721750; // 0.98G

    let Ys = (rgb.r/255.0)**trc*Rco + (rgb.g/255.0)**trc*Gco + (rgb.b/255.0)**trc*Bco;

    return Ys < flipYs ? 'white' : 'black'
}

export function getTextColor(color_code:string) {
    return 'text-'+maxContrast(hexToRgb(color_code))
}