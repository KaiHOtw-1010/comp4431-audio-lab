function lerp(value1, value2, percentage) {
    if(percentage < 0) return value1;
    if(percentage > 1) return value2;
    return value1 + (value2 - value1) * percentage;
    // eg. lerp( v0 , v1 , t )
    // v = v0 * (1 - t) + v1 * t
}
