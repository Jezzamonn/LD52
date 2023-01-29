import { sfxr } from "jsfxr";
import { MuteState, Sounds } from "../lib/sounds";

const sfx = {
    land: {
        oldParams: true,
        wave_type: 0,
        p_env_attack: 0,
        p_env_sustain: 0.010171919252742523,
        p_env_punch: 0,
        p_env_decay: 0.18206130467654957,
        p_base_freq: 0.5422948751086346,
        p_freq_limit: 0,
        p_freq_ramp: -0.6603650387694955,
        p_freq_dramp: 0,
        p_vib_strength: 0,
        p_vib_speed: 0,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0.5496316985887535,
        p_duty_ramp: 0,
        p_repeat_speed: 0,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 1,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0.027571379671559426,
        p_hpf_ramp: 0,
        sound_vol: 0.08,
        sample_rate: 44100,
        sample_size: 8,
    },
    bury: {
        oldParams: true,
        wave_type: 0,
        p_env_attack: 0,
        p_env_sustain: 0.029099505035117757,
        p_env_punch: 0,
        p_env_decay: 0.1249571078939638,
        p_base_freq: 0.5332707600658109,
        p_freq_limit: 0,
        p_freq_ramp: -0.5688204519027098,
        p_freq_dramp: 0,
        p_vib_strength: 0,
        p_vib_speed: 0,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0.21090223016557416,
        p_duty_ramp: 0,
        p_repeat_speed: 0,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 1,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0.153353023914276,
        p_hpf_ramp: 0,
        sound_vol: 0.15,
        sample_rate: 44100,
        sample_size: 8,
    },
    walk: {
        oldParams: true,
        wave_type: 0,
        p_env_attack: 0,
        p_env_sustain: 0.010171919252742523,
        p_env_punch: 0,
        p_env_decay: 0.18206130467654957,
        p_base_freq: 0.555,
        p_freq_limit: 0,
        p_freq_ramp: -0.6603650387694955,
        p_freq_dramp: 0,
        p_vib_strength: 0,
        p_vib_speed: 0,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0.5496316985887535,
        p_duty_ramp: 0,
        p_repeat_speed: 0,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 1,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0.783,
        p_hpf_ramp: 0,
        sound_vol: 0.05,
        sample_rate: 44100,
        sample_size: 8,
    },
    grow: {
        oldParams: true,
        wave_type: 0,
        p_env_attack: 0,
        p_env_sustain: 0.2280823275059672,
        p_env_punch: 0,
        p_env_decay: 0.34279008988393245,
        p_base_freq: 0.299,
        p_freq_limit: 0,
        p_freq_ramp: 0.19171862067828294,
        p_freq_dramp: 0,
        p_vib_strength: 0,
        p_vib_speed: 0,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0.3017221517283857,
        p_duty_ramp: 0,
        p_repeat_speed: 0,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 1,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0,
        p_hpf_ramp: 0,
        sound_vol: 0.1,
        sample_rate: 44100,
        sample_size: 8,
    },
    growDirt: {
        oldParams: true,
        wave_type: 0,
        p_env_attack: 0,
        p_env_sustain: 0.2280823275059672,
        p_env_punch: 0,
        p_env_decay: 0.34279008988393245,
        p_base_freq: 0.127,
        p_freq_limit: 0,
        p_freq_ramp: 0.19171862067828294,
        p_freq_dramp: 0,
        p_vib_strength: 0,
        p_vib_speed: 0,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0.3017221517283857,
        p_duty_ramp: 0,
        p_repeat_speed: 0,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 1,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0,
        p_hpf_ramp: 0,
        sound_vol: 0.1,
        sample_rate: 44100,
        sample_size: 8,
    },
    growVine: {
        oldParams: true,
        wave_type: 0,
        p_env_attack: 0,
        p_env_sustain: 0.2280823275059672,
        p_env_punch: 0,
        p_env_decay: 0.6,
        p_base_freq: 0.14,
        p_freq_limit: 0,
        p_freq_ramp: 0.19171862067828294,
        p_freq_dramp: 0,
        p_vib_strength: 0,
        p_vib_speed: 0,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0.3017221517283857,
        p_duty_ramp: 0,
        p_repeat_speed: 0,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 1,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0,
        p_hpf_ramp: 0,
        sound_vol: 0.1,
        sample_rate: 44100,
        sample_size: 8,
    },
    explode: {
        oldParams: true,
        wave_type: 3,
        p_env_attack: 0,
        p_env_sustain: 0.27017075032787863,
        p_env_punch: 0.7463896577934348,
        p_env_decay: 0.455,
        p_base_freq: 0.083,
        p_freq_limit: 0,
        p_freq_ramp: -0.2685318780259187,
        p_freq_dramp: 0,
        p_vib_strength: 0.08846631519704022,
        p_vib_speed: 0.5385916478516865,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0,
        p_duty_ramp: 0,
        p_repeat_speed: 0.748727277878958,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 1,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0,
        p_hpf_ramp: 0.024,
        sound_vol: 0.1,
        sample_rate: 44100,
        sample_size: 8,
    },
    explodeSmall: {
        oldParams: true,
        wave_type: 3,
        p_env_attack: 0,
        p_env_sustain: 0.27017075032787863,
        p_env_punch: 0.7463896577934348,
        p_env_decay: 0.2,
        p_base_freq: 0.090,
        p_freq_limit: 0,
        p_freq_ramp: -0.2685318780259187,
        p_freq_dramp: 0,
        p_vib_strength: 0.08846631519704022,
        p_vib_speed: 0.5385916478516865,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0,
        p_duty_ramp: 0,
        p_repeat_speed: 0.748727277878958,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 1,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0,
        p_hpf_ramp: 0.024,
        sound_vol: 0.05,
        sample_rate: 44100,
        sample_size: 8,
    },
    growFlower: {
        oldParams: true,
        wave_type: 0,
        p_env_attack: 0,
        p_env_sustain: 0.2280823275059672,
        p_env_punch: 0,
        p_env_decay: 0.34279008988393245,
        p_base_freq: 0.4,
        p_freq_limit: 0,
        p_freq_ramp: 0.19171862067828294,
        p_freq_dramp: 0,
        p_vib_strength: 0,
        p_vib_speed: 0,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0.3017221517283857,
        p_duty_ramp: 0,
        p_repeat_speed: 0,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 1,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0,
        p_hpf_ramp: 0,
        sound_vol: 0.1,
        sample_rate: 44100,
        sample_size: 8,
    },
    growFail: {
        oldParams: true,
        wave_type: 0,
        p_env_attack: 0,
        p_env_sustain: 0.13142192673828546,
        p_env_punch: 0,
        p_env_decay: 0.373,
        p_base_freq: 0.4025438090854984,
        p_freq_limit: 0,
        p_freq_ramp: -0.131,
        p_freq_dramp: 0,
        p_vib_strength: 0,
        p_vib_speed: 0,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0.1343344143109507,
        p_duty_ramp: 0,
        p_repeat_speed: 0,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 0.9286218032236752,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0,
        p_hpf_ramp: 0,
        sound_vol: 0.1,
        sample_rate: 44100,
        sample_size: 8,
    },
    sweep: {
        oldParams: true,
        wave_type: 3,
        p_env_attack: 0.242,
        p_env_sustain: 0.04056781997495254,
        p_env_punch: 0,
        p_env_decay: 0.496,
        p_base_freq: 0.315,
        p_freq_limit: 0,
        p_freq_ramp: 0.123,
        p_freq_dramp: 0,
        p_vib_strength: 0,
        p_vib_speed: 0,
        p_arp_mod: 0,
        p_arp_speed: 0,
        p_duty: 0.19109457007807684,
        p_duty_ramp: 0,
        p_repeat_speed: 0,
        p_pha_offset: 0,
        p_pha_ramp: 0,
        p_lpf_freq: 0.4,
        p_lpf_ramp: 0,
        p_lpf_resonance: 0,
        p_hpf_freq: 0.308,
        p_hpf_ramp: 0,
        sound_vol: 0.15,
        sample_rate: 44100,
        sample_size: 8,
    },
};

class _SFX {
    sounds: { [key: string]: any } = {};

    preload() {
        for (let key in sfx) {
            this.sounds[key] = sfxr.toAudio(sfx[key]);
        }
    }

    play(name: string) {
        if (Sounds.muteState === MuteState.ALL_OFF) {
            return;
        }

        const sound = this.sounds[name];
        if (sound) {
            sound.play();
        }
    }
}

export const SFX = new _SFX();
