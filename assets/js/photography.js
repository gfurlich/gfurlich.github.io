/* Photo data */
const photos = [
    {
    src: "/assets/photography/kirkham_NP_Photo_Winner.jpg",
    cap: "Grand Teton NP at the Snake River Overlook",
    tag: "Featured — Kirkham's National Parks Photo Contest, First Prize 2016 · (c) Greg Furlich 2016"
    },
    {
    src: "/assets/photography/Dust_Storm_Delta_20190606.JPG",
    cap: "The Drum Mountains in Millard County, Utah after a wet spring in the Sevier desert",
    tag: "Nature · 2019 · (c) Greg Furlich 2019"
    },
    {
    src: "/assets/photography/Banff_NP_Rainbow.JPG",
    cap: "Rainbow in Banff NP, Canada",
    tag: "Nature · (c) Greg Furlich 2019"
    },
    {
    src: "/assets/photography/moose_staredown.jpg",
    cap: "Two moose staring each other down early in the morning. Wasatch Range, UT",
    tag: "Wildlife · (c) Greg Furlich 2019 "
    },
    {
    src: "/assets/photography/Modified_Exposures/DSC_0026_mod.JPG",
    cap: "Long exposure of the Milky Way behind TAx4 Fluorescence Detectors, Telescope Array Cosmic Ray Observatory",
    tag: "Astrophotography · Long Exposure · (c) Greg Furlich 2018"
    },
    {
    src: "/assets/photography/Modified_Exposures/DSC_0036_mod.jpg",
    cap: "Long exposure of the sunrise at TAx4 FDs, Telescope Array Cosmic Ray Observatory",
    tag: "Astrophotography · Long Exposure · (c) Greg Furlich 2018"
    },
    {
    src: "/assets/photography/Modified_Exposures/DSC_0078_mod.jpg",
    cap: "Long exposure TAx4 FDs with light painting using a green LED headlamp",
    tag: "Astrophotography · Long Exposure · Light Painting · (c) Greg Furlich 2018"
    },
    {
    src: "/assets/photography/Lunar_Eclipse_20190121.JPG",
    cap: "Lunar Eclipse. 2019-01-21",
    tag: "Astrophotography · Moon · (c) Greg Furlich 2019"
    },
    {
    src: "/assets/photography/aurora.jpg",
    cap: "Aurora Borealis. Summer 2025",
    tag: "Astrophotography · Aurora · (c) Greg Furlich 2025"
    },
    {
    src: "/assets/2024_Solar_Eclipse/20240410_0003.jpg",
    cap: "Solar Eclipse. Grand Lake St Mary's State Park, OH",
    tag: "Astrophotography · Solar Eclipse 2024 · (c) Greg Furlich 2024"
    },
    {
    src: "/assets/2024_Solar_Eclipse/20240410_0011.jpg",
    cap: "Solar Eclipse Totality. Grand Lake St Mary's State Park, OH",
    tag: "Astrophotography · Solar Eclipse 2024 · (c) Greg Furlich 2024"
    },
    {
    src: "/assets/2024_Solar_Eclipse/DSC_0181.JPG",
    cap: "Solar Eclipse. Totality Grand Lake St Mary's State Park, OH",
    tag: "Astrophotography · Solar Eclipse 2024 · (c) Greg Furlich 2024"
    }
];

let currentIdx = 0;

function openLB(i) {
    currentIdx = i;
    renderLB();
    document.getElementById("lb").classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeLB() {
    document.getElementById("lb").classList.remove("open");
    document.body.style.overflow = "";
}

function lbBgClose(e) {
    if (e.target === document.getElementById("lb")) closeLB();
}

function lbNav(dir) {
    currentIdx = (currentIdx + dir + photos.length) % photos.length;
    renderLB();
}

function renderLB() {
    const p = photos[currentIdx];
    document.getElementById("lb-img").src = p.src;
    document.getElementById("lb-img").alt = p.cap;
    document.getElementById("lb-cap").textContent = p.cap;
    document.getElementById("lb-tag").textContent = p.tag;
}

/* Keyboard navigation */
document.addEventListener("keydown", function(e) {
    if (!document.getElementById("lb").classList.contains("open")) return;
    if (e.key === "ArrowLeft")  lbNav(-1);
    if (e.key === "ArrowRight") lbNav(1);
    if (e.key === "Escape")     closeLB();
});