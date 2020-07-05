/* jshint shadow:true */

// This object represent the postprocessor
Postprocessor = {
    // The postprocess function takes the audio samples data and the post-processing effect name
    // and the post-processing stage as function parameters. It gathers the required post-processing
    // paramters from the <input> elements, and then applies the post-processing effect to the
    // audio samples data of every channels.
    postprocess: function(channels, effect, pass) {
        switch(effect) {
            case "no-pp":
                // Do nothing
                break;

            case "reverse":
                /**
                * TODO: Complete this function
                **/

                // Post-process every channels
                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;

                    // Apply reverse to the audioSequence
                    audioSequence.data.reverse();

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "boost":
                // Find the maximum gain of all channels
                var maxGain = -1.0;
                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;
                    var gain = audioSequence.getGain();
                    if(gain > maxGain) {
                        maxGain = gain;
                    }
                }

                // Determin the boost multiplier
                var multiplier = 1.0 / maxGain;

                // Post-process every channels
                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;

                    // For every sample, apply a boost multiplier
                    for(var i = 0; i < audioSequence.data.length; ++i) {
                        audioSequence.data[i] *= multiplier;
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "adsr":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var attackDuration = parseFloat($("#adsr-attack-duration").data("p" + pass)) * sampleRate;
                var decayDuration = parseFloat($("#adsr-decay-duration").data("p" + pass)) * sampleRate;
                var releaseDuration = parseFloat($("#adsr-release-duration").data("p" + pass)) * sampleRate;
                var sustainLevel = parseFloat($("#adsr-sustain-level").data("p" + pass)) / 100.0;

                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;

                    var sustainDuration = audioSequence.data.length - attackDuration - decayDuration - releaseDuration;

                    for(var i = 0; i < audioSequence.data.length; ++i) {

                        // TODO: Complete the ADSR postprocessor
                        // Hint: You can use the function lerp() in utility.js
                        // for performing linear interpolation

                        if (i < attackDuration) {
                            // attack period: x0=0, x1=aD, y0=0, y1=1
                            var t_lerp = (i - 0) / (attackDuration - 0);
                            var multiplier = lerp(0, 1, t_lerp);
                            audioSequence.data[i] = audioSequence.data[i] * multiplier;
                        }
                        else if (i >= attackDuration  &&  i < attackDuration + decayDuration) {
                            // decay period: x0=aD, x1=aD+dD, y0=1, y1=sL
                            var t_lerp = (i - attackDuration) / ((attackDuration+decayDuration) - attackDuration);
                            var multiplier = lerp(1, sustainLevel, t_lerp);
                            audioSequence.data[i] = audioSequence.data[i] * multiplier;
                        }
                        else if (i >= attackDuration + decayDuration + sustainDuration  &&  i < audioSequence.data.length) {
                            // release period: x0=aD+dD+sD, x1=.len-1, y0=sL, y1=0
                            var t_lerp = (i - (attackDuration+decayDuration+sustainDuration)) /
                                            (audioSequence.data.length-1 - (attackDuration+decayDuration+sustainDuration));
                            var multiplier = lerp(sustainLevel, 0, t_lerp);
                            audioSequence.data[i] = audioSequence.data[i] * multiplier;
                        }
                        else {
                            // sustain period: aD+dD <= i <= aD+dD+sD-1, multiplier is constant
                            var multiplier = sustainLevel;
                            audioSequence.data[i] = audioSequence.data[i] * multiplier;
                        }
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "tremolo":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var tremoloFrequency = parseFloat($("#tremolo-frequency").data("p" + pass));
                var wetness = parseFloat($("#tremolo-wetness").data("p" + pass));

                // Post-process every channels
                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;

                    // For every sample, apply a tremolo multiplier
                    for (var i = 0; i < audioSequence.data.length; ++i) {
                        var currentTime = i / sampleRate;   // multiplier sine wave right shift by pi/2
                        var multiplier = (Math.sin(2.0 * Math.PI * tremoloFrequency * currentTime - Math.PI/2) + 1) / 2;  // range: 0~1
                        multiplier = multiplier * wetness + (1 - wetness);
                        audioSequence.data[i] *= multiplier;
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            case "echo":
                /**
                * TODO: Complete this function
                **/

                // Obtain all the required parameters
                var delayLineDuration = parseFloat($("#echo-delay-line-duration").data("p" + pass));
                var multiplier = parseFloat($("#echo-multiplier").data("p" + pass));
                var delayLineSize = parseInt(delayLineDuration * sampleRate);   // number of samples in the delayLine

                // Post-process every channels
                for(var c = 0; c < channels.length; ++c) {
                    // Get the sample data of the channel
                    var audioSequence = channels[c].audioSequenceReference;

                    // Create a new empty delay line
                    var delayLine = [];
                    for (i = 0; i < delayLineSize; ++i)
                        delayLine.push(0);
                    var delayLineOutput;    // output of the delayLine (temporary storage)

                    // Get the sample data of the channel
                    for(var i = 0; i < audioSequence.data.length; ++i) {
                        // Get the echoed sample from the delay line
                        delayLineOutput = delayLine[i % delayLineSize];
                        // Add the echoed sample to the current sample, with a multiplier
                        audioSequence.data[i] = audioSequence.data[i] + multiplier * delayLineOutput;

                        // I do not handle clipping here in my solution. I will later pp with 'boost'

                        // Put the current sample into the delay line
                        delayLine[i % delayLineSize] = audioSequence.data[i];
                    }

                    // Update the sample data with the post-processed data
                    channels[c].setAudioSequence(audioSequence);
                }
                break;

            default:
                // Do nothing
                break;
        }
        return;
    }
};
