export function sliderInit(slider) {
    slider.value = loadSlider(slider);
    slider.addEventListener("change", (e) => {
        saveSlider(slider);
    });
}

export function saveSlider(slider) {
    window.localStorage.setItem("element-slider" + slider.id, slider.value);
}

export function loadSlider(slider, defaultValiue = 25) {
    let val = window.localStorage.getItem("element-slider" + slider.id);
    val == "undefined" ? val = defaultValiue : val = val; //javskript momenat, proveri dali je undefined ako jeste onda postavi vrednost defaultValiue
    return val;
}