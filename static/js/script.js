class BeforeAfter {
    constructor(enteryObject) {

        const beforeAfterContainer = document.querySelector(enteryObject.id);
        const before = beforeAfterContainer.querySelector('.bal-before');
        const beforeText = beforeAfterContainer.querySelector('.bal-beforePosition');
        const afterText = beforeAfterContainer.querySelector('.bal-afterPosition');
        const handle = beforeAfterContainer.querySelector('.bal-handle');
        var widthChange = 0;

        beforeAfterContainer.querySelector('.bal-before-inset').setAttribute("style", "width: " + beforeAfterContainer.offsetWidth + "px;")
        window.onresize = function () {
            beforeAfterContainer.querySelector('.bal-before-inset').setAttribute("style", "width: " + beforeAfterContainer.offsetWidth + "px;")
        }
        before.setAttribute('style', "width: 50%;");
        handle.setAttribute('style', "left: 50%;");

        //touch screen event listener
        beforeAfterContainer.addEventListener("touchstart", (e) => {

            beforeAfterContainer.addEventListener("touchmove", (e2) => {
                let containerWidth = beforeAfterContainer.offsetWidth;
                let currentPoint = e2.changedTouches[0].clientX;

                let startOfDiv = beforeAfterContainer.offsetLeft;

                let modifiedCurrentPoint = currentPoint - startOfDiv;

                if (modifiedCurrentPoint > 10 && modifiedCurrentPoint < beforeAfterContainer.offsetWidth - 10) {
                    let newWidth = modifiedCurrentPoint * 100 / containerWidth;

                    before.setAttribute('style', "width:" + newWidth + "%;");
                    afterText.setAttribute('style', "z-index: 1;");
                    handle.setAttribute('style', "left:" + newWidth + "%;");
                }
            });
        });

        //mouse move event listener
        beforeAfterContainer.addEventListener('mousemove', (e) => {
            let containerWidth = beforeAfterContainer.offsetWidth;
            widthChange = e.offsetX;
            let newWidth = widthChange * 100 / containerWidth;

            if (e.offsetX > 10 && e.offsetX < beforeAfterContainer.offsetWidth - 10) {
                before.setAttribute('style', "width:" + newWidth + "%;");
                afterText.setAttribute('style', "z-index:" + "1;");
                handle.setAttribute('style', "left:" + newWidth + "%;");
            }
        })

    }
}


document.addEventListener("DOMContentLoaded", function () {
    function updateMainContainerWidth() {
    const mainContainer = document.querySelector(".container.is-max-desktop");
    if (mainContainer) {
        const containerWidth = mainContainer.offsetWidth;
        const screenWidth = window.innerWidth;
        if (screenWidth * 0.08 < (screenWidth - containerWidth) / 2) {
        colorBarPosition = `${(screenWidth - containerWidth) / 2 - screenWidth * 0.08}px`;
        } else {
        colorBarPosition = `0`;
        }
        document.documentElement.style.setProperty(
        "--color-bar-right-position",
        colorBarPosition
        );
    }
    }
    updateMainContainerWidth();
    window.addEventListener("resize", updateMainContainerWidth);

    
    const colorBar = document.getElementById("color-bar");
    const targetSections = document.querySelectorAll(".colorbar-section");
    function isSectionInView(section) {
    const rect = section.getBoundingClientRect();
    const sectionHeight = rect.height;
    const visibleHeight = Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top);
    return visibleHeight >= sectionHeight * 0.5;
    }

    function toggleColorBar() {
    let showColorBar = false;
    targetSections.forEach((section) => {
        if (isSectionInView(section)) {
        showColorBar = true;
        }
    });
    if (showColorBar) {
        colorBar.classList.add("visible");
    } else {
        colorBar.classList.remove("visible");
    }
    }
    toggleColorBar();
    window.addEventListener("scroll", toggleColorBar);

    
    const collapsedFolders = document.querySelectorAll('.tree .folder.collapsed');
    collapsedFolders.forEach(folder => {
    const parentLi = folder.parentElement;
    parentLi.classList.add('collapsed');
    });

});


function changeTeaser(side) {
    var selectedValue = document.getElementById("imageSelector-" + side).value;
    document.getElementById("teaser-" + side).src = "static/images/" + selectedValue;
    var imageDescriptions = {
    "teaser-in-1.png": "Noisy input #1",
    "teaser-in-2.png": "Noisy input #2",
    "teaser-col-est-1.png": "Restored color map #1",
    "teaser-col-est-2.png": "Restored color map #2",
    "teaser-col-shp.png": "Sharpened color map",
    "teaser-bndy-est.png": "Boundary map",
    "teaser-dep-gt.png": "Depth ground truth",
    "teaser-dep-est.png": "Depth map"
    };
    var newLabel = imageDescriptions[selectedValue] || "No description available";
    document.getElementById("teaserLabel-" + side).innerHTML = newLabel;
}


function setHeight() {
    var ulElement = document.querySelector(".nav.nav-pills");
    if (ulElement) {
    var width = ulElement.offsetWidth;
    ulElement.style.height = (0.28 * width) + "px";
    }
}

window.onload = setHeight;
window.onresize = setHeight;


let selectedImages = {"synthetic": 101, "real": 201};
function selectImage(imgElement) {
    const group = imgElement.getAttribute("data-group");
    const imageId = imgElement.getAttribute("data-id");
    document.querySelectorAll(`img[data-group='${group}']`).forEach(img => img.classList.remove("image-selected"));
    imgElement.classList.add("image-selected");
    selectedImages[group] = imageId;
}


function change_image(id, loc) {
    document.querySelectorAll(".image-group-comp").forEach(group => {
    group.style.display = "none";
    });
    document.getElementById("group" + id).style.display = "grid";
}


// Data structure tree toggle functionality
function toggleFolder(toggleElement) {
    const parentLi = toggleElement.parentElement;
    const isCollapsed = parentLi.classList.contains('collapsed');
    
    if (isCollapsed) {
    // Expand
    parentLi.classList.remove('collapsed');
    toggleElement.textContent = '-';
    } else {
    // Collapse
    parentLi.classList.add('collapsed');
    toggleElement.textContent = '+';
    }
}


MathJax = {
    tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
};