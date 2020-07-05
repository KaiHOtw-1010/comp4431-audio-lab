/* jshint shadow:true */

// This object represent the waveform generator
var WaveformGenerator = {
    // The generateWaveform function takes 4 parameters:
    //     - type, the type of waveform to be generated
    //     - frequency, the frequency of the waveform to be generated
    //     - amp, the maximum amplitude of the waveform to be generated
    //     - duration, the length (in seconds) of the waveform to be generated
    //     - sampleRate, a global variable = 44,100 for my Mac
    generateWaveform: function(type, frequency, amp, duration) {
        var nyquistFrequency = sampleRate / 2; // Nyquist frequency
        var totalSamples = Math.floor(sampleRate * duration); // Number of samples to generate
        var result = []; // The temporary array for storing the generated samples

        switch(type) {
            case "sine-time": // Sine wave, time domain
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    result.push(amp * Math.sin(2.0 * Math.PI * frequency * currentTime));
                }
                break;

            case "square-time": // Square wave, time domain
                /**
                * TODO: Complete this generator
                **/
                var oneCycle = Math.floor(sampleRate / frequency); // how many samples in a cycle.
                var halfCycle = oneCycle/2;                        // how many samples in half a cycle.
                for (var i = 0; i < totalSamples; ++i) {
                    var whereIntheCycle = i % oneCycle;
                    if (whereIntheCycle < halfCycle)  // first half of the cycle.
                        result.push(1 * amp);
                    else                              // second half of the cycle.
                        result.push(-1 * amp);
                }
                break;

            case "square-additive": // Square wave, additive synthesis
                /**
                * TODO: Complete this generator
                **/
                var totalWaves = 0;
                for (var k = 1; k * frequency < nyquistFrequency; k += 2)
                    ++totalWaves;
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    var sample = 0;
                    for (var k = 1; k < totalWaves * 2; k += 2) {
                        sample += amp * (1.0/k) * Math.sin(2.0 * Math.PI * k * frequency * currentTime);
                    }
                    result.push(sample);
                }
                break;

            case "sawtooth-time": // Sawtooth wave, time domain. Note that it is reverse sawtooth here.
                /**
                * TODO: Complete this generator
                **/
                var oneCycle = Math.floor(sampleRate / frequency);
                for (var i = 0; i < totalSamples; ++i) {
                    var whereIntheCycle = i % oneCycle;
                    var fractionIntheCycle = whereIntheCycle / oneCycle;
                    result.push(-2 * amp * fractionIntheCycle + amp);
                }
                break;

            case "sawtooth-additive": // Sawtooth wave, additive synthesis
                /**
                * TODO: Complete this generator
                **/
                var totalWaves = 0;
                for (var k = 1; k * frequency < nyquistFrequency; ++k)
                    ++totalWaves;
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    var sample = 0;
                    for (var k = 1; k < totalWaves; ++k) {
                        sample += amp * (1.0/k) * Math.sin(2.0 * Math.PI * k * frequency * currentTime);
                    }
                    result.push(sample);
                }
                break;

            case "triangle-additive": // Triangle wave, additive synthesis
                /**
                * TODO: Complete this generator
                **/
                var totalWaves = 0;
                for (var k = 1; k * frequency < nyquistFrequency; k += 2)
                    ++totalWaves;
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    var sample = 0;
                    for (var k = 1; k < totalWaves * 2; k += 2) {
                        sample += amp * (1.0 / (k*k)) * Math.cos(2.0 * Math.PI * k * frequency * currentTime);
                    }
                    result.push(sample);
                }
                break;

            case "karplus-strong": // Karplus-Strong algorithm
                /**
                * TODO: Complete this generator
                **/

                // Obtain all the required parameters
                var base = $("#karplus-base>option:selected").val();    // white noise or sawtooth, type = string
                var b = parseFloat($("#karplus-b").val());              // blend factor, type = number
                var delay = parseInt($("#karplus-p").val());            // delay p, type = number
                var useFreqInput = $("#karplus-use-freq").prop("checked");

                if (useFreqInput) {
                    // p or delay, needs to be calculated from the frequency of General Input Zone.
                    delay = Math.round(sampleRate / frequency);
                }
                // else, i.e. if (!useFreqInput)
                // p or delay, is the same as the p-input, i.e. parseInt($("#karplus-p").val())

                for (var i = 0; i < totalSamples; ++i) {
                    if (i <= delay) {
                        if (base == "sawtooth") {
                            // the whole interval 0<=i<=delay is oneCycle
                            var oneCycle = delay;
                            var whereIntheCycle = i % oneCycle; // i == delay belongs to a new cycle -> whereIntheCycle == 0
                            var fractionIntheCycle = whereIntheCycle / oneCycle;
                            result.push(-2 * amp * fractionIntheCycle + amp);
                        }
                        else   // base == "white-noise"
                            result.push(amp * (Math.random() * 2 - 1));
                    }
                    else {
                        // about the blending factor:
                        // probability of b: original KS, probability of 1-b: negated KS
                        var b_decision = Math.random();
                        if (b_decision < b)
                            result.push(0.5 * (result[i-delay] + result[i-delay-1]));
                        else // b_decision >= b
                            result.push(-0.5 * (result[i-delay] + result[i-delay-1]));
                    }
                }
                break;

            case "white-noise": // White noise
                /**
                * TODO: Complete this generator
                **/
                for (var i = 0; i < totalSamples; ++i) {
                    result.push(amp * (Math.random() * 2 - 1));
                }
                break;

            case "customized-additive-synthesis": // Customized additive synthesis
                /**
                * TODO: Complete this generator
                **/
                // Obtain all the required parameters
				var harmonics = [];
				for (var h = 1; h <= 10; ++h) {
					harmonics.push(parseFloat($("#additive-f" + h).val()));
				}
                var totalWaves = 0;
                for (var k = 1; k <= 10; ++k) {
                    if (k * frequency < nyquistFrequency)
                        ++totalWaves;
                }
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    var sample = 0;
                    for (var h = 1; h <= totalWaves; ++h) {
                        sample += amp * harmonics[h-1] * Math.sin(2.0 * Math.PI * h * frequency * currentTime);
                    }
                    result.push(sample);
                }
                break;

            case "fm": // FM
                /**
                * TODO: Complete this generator
                **/

                // Obtain all the required parameters
                var carrierFrequency = parseFloat($("#fm-carrier-frequency").val());
                var carrierAmplitude = parseFloat($("#fm-carrier-amplitude").val());
                var modulationFrequency = parseFloat($("#fm-modulation-frequency").val());
                var modulationAmplitude = parseFloat($("#fm-modulation-amplitude").val());

                var useFreqMult = $("#fm-use-freq-multiplier").prop("checked");
                var useADSR = $("#fm-use-adsr").prop("checked");

                if(useFreqMult) {

                    carrierFrequency = carrierFrequency * frequency;
                    modulationFrequency = modulationFrequency * frequency;

                    if(useADSR) { // Obtain the ADSR parameters
                        var attackDuration = parseFloat($("#fm-adsr-attack-duration").val()) * sampleRate;
                        var decayDuration = parseFloat($("#fm-adsr-decay-duration").val()) * sampleRate;
                        var releaseDuration = parseFloat($("#fm-adsr-release-duration").val()) * sampleRate;
                        var sustainLevel = parseFloat($("#fm-adsr-sustain-level").val()) / 100.0;
                        var sustainDuration = totalSamples - attackDuration - decayDuration - releaseDuration;

                        for (var i = 0; i < totalSamples; ++i) {
                            var currentTime = i / sampleRate;
                            var modulator = modulationAmplitude * Math.sin(2.0 * Math.PI * modulationFrequency * currentTime);
                            // ADSR //
                            if (i < attackDuration) {
                                // attack period: x0=0, x1=aD, y0=0, y1=1
                                var t_lerp = (i - 0) / (attackDuration - 0);
                                var multiplier = lerp(0, 1, t_lerp);
                                modulator = modulator * multiplier;
                            }
                            else if (i >= attackDuration  &&  i < attackDuration + decayDuration) {
                                // decay period: x0=aD, x1=aD+dD, y0=1, y1=sL
                                var t_lerp = (i - attackDuration) / ((attackDuration+decayDuration) - attackDuration);
                                var multiplier = lerp(1, sustainLevel, t_lerp);
                                modulator = modulator * multiplier;
                            }
                            else if (i >= attackDuration + decayDuration + sustainDuration  &&  i < totalSamples) {
                                // release period: x0=aD+dD+sD, x1=.len-1, y0=sL, y1=0
                                var t_lerp = (i - (attackDuration+decayDuration+sustainDuration)) /
                                                (totalSamples-1 - (attackDuration+decayDuration+sustainDuration));
                                var multiplier = lerp(sustainLevel, 0, t_lerp);
                                modulator = modulator * multiplier;
                            }
                            else {
                                // sustain period: aD+dD <= i <= aD+dD+sD-1, multiplier is constant
                                var multiplier = sustainLevel;
                                modulator = modulator * multiplier;
                            }
                            // ADSR //
                            result.push(amp * carrierAmplitude * Math.sin(2.0 * Math.PI * carrierFrequency * currentTime + modulator));
                        }
                    }
                    else {  // i.e. useFreqMult && !useADSR
                        for (var i = 0; i < totalSamples; ++i) {
                            var currentTime = i / sampleRate;
                            var modulator = modulationAmplitude * Math.sin(2.0 * Math.PI * modulationFrequency * currentTime);
                            result.push(amp * carrierAmplitude * Math.sin(2.0 * Math.PI * carrierFrequency * currentTime + modulator));
                        }
                    }
                }
                else {  // i.e. if (!useFreqMult)
                    if(useADSR) { // Obtain the ADSR parameters
                        var attackDuration = parseFloat($("#fm-adsr-attack-duration").val()) * sampleRate;
                        var decayDuration = parseFloat($("#fm-adsr-decay-duration").val()) * sampleRate;
                        var releaseDuration = parseFloat($("#fm-adsr-release-duration").val()) * sampleRate;
                        var sustainLevel = parseFloat($("#fm-adsr-sustain-level").val()) / 100.0;
                        var sustainDuration = totalSamples - attackDuration - decayDuration - releaseDuration;

                        for (var i = 0; i < totalSamples; ++i) {
                            var currentTime = i / sampleRate;
                            var modulator = modulationAmplitude * Math.sin(2.0 * Math.PI * modulationFrequency * currentTime);
                            // ADSR //
                            if (i < attackDuration) {
                                // attack period: x0=0, x1=aD, y0=0, y1=1
                                var t_lerp = (i - 0) / (attackDuration - 0);
                                var multiplier = lerp(0, 1, t_lerp);
                                modulator = modulator * multiplier;
                            }
                            else if (i >= attackDuration  &&  i < attackDuration + decayDuration) {
                                // decay period: x0=aD, x1=aD+dD, y0=1, y1=sL
                                var t_lerp = (i - attackDuration) / ((attackDuration+decayDuration) - attackDuration);
                                var multiplier = lerp(1, sustainLevel, t_lerp);
                                modulator = modulator * multiplier;
                            }
                            else if (i >= attackDuration + decayDuration + sustainDuration  &&  i < totalSamples) {
                                // release period: x0=aD+dD+sD, x1=.len-1, y0=sL, y1=0
                                var t_lerp = (i - (attackDuration+decayDuration+sustainDuration)) /
                                                (totalSamples-1 - (attackDuration+decayDuration+sustainDuration));
                                var multiplier = lerp(sustainLevel, 0, t_lerp);
                                modulator = modulator * multiplier;
                            }
                            else {
                                // sustain period: aD+dD <= i <= aD+dD+sD-1, multiplier is constant
                                var multiplier = sustainLevel;
                                modulator = modulator * multiplier;
                            }
                            // ADSR //
                            result.push(amp * carrierAmplitude * Math.sin(2.0 * Math.PI * carrierFrequency * currentTime + modulator));
                        }
                    }
                    else {  // i.e. !useFreqMult && !useADSR <- the simplest one
                        for (var i = 0; i < totalSamples; ++i) {
                            var currentTime = i / sampleRate;
                            var modulator = modulationAmplitude * Math.sin(2.0 * Math.PI * modulationFrequency * currentTime);
                            result.push(amp * carrierAmplitude * Math.sin(2.0 * Math.PI * carrierFrequency * currentTime + modulator));
                        }
                    }
                }
                break;

            case "repeating-narrow-pulse": // Repeating narrow pulse
                var oneCycle = Math.floor(sampleRate / frequency); // how many samples in a cycle.
                for (var i = 0; i < totalSamples; ++i) {
                    if(i % oneCycle === 0) {
                        result.push(amp * 1.0);
                    } else if(i % oneCycle === 1) {
                        result.push(amp * -1.0);
                    } else {
                        result.push(0.0);
                    }
                }
                break;

            default:
                break;
        }

        return result;
    }
};
