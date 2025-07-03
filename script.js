// Main Solar System Application
class SolarSystem {
    constructor() {
        this.initScene();
        this.initRenderer();
        this.initCamera();
        this.initControls();
        this.initLights();
        this.initPlanets();
        this.initUI();
        this.initEventListeners();
        this.animate();
        
        this.createStarField();
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.isPaused = false;
        this.planets = [];
        this.planetsData = [
            { name: "Mercury", size: 0.2, distance: 5, speed: 0.04, texture: "mercury.jpg", 
              info: "The smallest planet in our solar system and closest to the Sun." },
            { name: "Venus", size: 0.4, distance: 7, speed: 0.03, texture: "venus.jpg", 
              info: "Similar in size to Earth, but with a toxic atmosphere of carbon dioxide." },
            { name: "Earth", size: 0.5, distance: 9, speed: 0.02, texture: "earth.jpg", 
              info: "Our home planet, the only known place in the universe confirmed to host life." },
            { name: "Mars", size: 0.3, distance: 11, speed: 0.018, texture: "mars.jpg", 
              info: "The Red Planet, home to the tallest mountain in the solar system." },
            { name: "Jupiter", size: 1.0, distance: 14, speed: 0.01, texture: "jupiter.jpg", 
              info: "The largest planet in our solar system, a gas giant with a Great Red Spot." },
            { name: "Saturn", size: 0.9, distance: 17, speed: 0.008, texture: "saturn.jpg", 
              info: "Famous for its beautiful rings made of ice and rock particles." },
            { name: "Uranus", size: 0.6, distance: 20, speed: 0.006, texture: "uranus.jpg", 
              info: "An ice giant that rotates on its side, with rings and 27 moons." },
            { name: "Neptune", size: 0.6, distance: 23, speed: 0.005, texture: "neptune.jpg", 
              info: "The windiest planet with the strongest winds in the solar system." }
        ];
    }
    
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('solarCanvas'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 50);
        this.camera.lookAt(0, 0, 0);
    }
    
    initControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 100;
    }
    
    initLights() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);
        
        this.pointLight = new THREE.PointLight(0xffffff, 2, 50);
        this.pointLight.position.set(0, 0, 0);
        this.scene.add(this.pointLight);
        
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
        this.directionalLight.position.set(1, 1, 1);
        this.scene.add(this.directionalLight);
    }
    
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        const starVertices = [];
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }
    
    initPlanets() {
        this.createSun();
        this.planetsData.forEach(data => {
            this.createPlanet(data);
        });
    }
    
    createSun() {
        const textureLoader = new THREE.TextureLoader();
        const sunTexture = textureLoader.load(`assets/images/sun.jpg`);
        
        const sunMaterial = new THREE.MeshBasicMaterial({ 
            map: sunTexture,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        
        const sunGeometry = new THREE.SphereGeometry(3, 64, 64);
        this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sunMesh);
        
        const glowGeometry = new THREE.SphereGeometry(3.5, 64, 64);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.3
        });
        this.sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(this.sunGlow);
    }
    
    createPlanet(data) {
        const textureLoader = new THREE.TextureLoader();
        const planetTexture = textureLoader.load(`assets/images/${data.texture}`);
        
        const material = new THREE.MeshStandardMaterial({
            map: planetTexture,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        const planetMesh = new THREE.Mesh(geometry, material);
        
        const angle = Math.random() * Math.PI * 2;
        planetMesh.position.set(
            Math.cos(angle) * data.distance,
            0,
            Math.sin(angle) * data.distance
        );
        
        planetMesh.userData = {
            name: data.name,
            info: data.info,
            angle: angle,
            speed: data.speed,
            originalSpeed: data.speed,
            distance: data.distance,
            size: data.size
        };
        
        this.scene.add(planetMesh);
        this.planets.push(planetMesh);
    }
    
    initUI() {
        const slidersContainer = document.getElementById('sliders');
        
        this.planetsData.forEach((data, index) => {
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'slider-group';
            sliderGroup.innerHTML = `
                <label>${data.name}</label>
                <input type="range" min="0" max="0.1" step="0.001" 
                       value="${data.speed}" data-planet="${index}">
                <span class="speed-value">${data.speed.toFixed(3)}</span>
            `;
            slidersContainer.appendChild(sliderGroup);
        });
        
        this.planetInfo = document.getElementById('planet-info');
        this.planetName = document.getElementById('planet-name');
        this.planetDetails = document.getElementById('planet-details');
    }
    
    initEventListeners() {
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', e => {
                const planetIndex = parseInt(e.target.dataset.planet);
                const newSpeed = parseFloat(e.target.value);
                this.planets[planetIndex].userData.speed = newSpeed;
                e.target.nextElementSibling.textContent = newSpeed.toFixed(3);
            });
        });
        
        document.getElementById('toggle-animation').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            document.getElementById('toggle-animation').textContent = 
                this.isPaused ? '▶️ Resume' : '⏸ Pause';
        });
        
        document.getElementById('reset-speeds').addEventListener('click', () => {
            this.planets.forEach((planet, index) => {
                planet.userData.speed = planet.userData.originalSpeed;
                const slider = document.querySelector(`input[data-planet="${index}"]`);
                slider.value = planet.userData.originalSpeed;
                slider.nextElementSibling.textContent = planet.userData.originalSpeed.toFixed(3);
            });
        });
        
        document.getElementById('reset-camera').addEventListener('click', () => {
            this.camera.position.set(0, 10, 50);
            this.camera.lookAt(0, 0, 0);
            this.controls.reset();
        });
        
        document.getElementById('toggle-theme').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            document.getElementById('toggle-theme').textContent = isDark ? '☀️' : '🌙';
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            const intersects = raycaster.intersectObjects(this.planets);
            
            if (intersects.length > 0) {
                const planet = intersects[0].object;
                this.planetName.textContent = planet.userData.name;
                this.planetDetails.textContent = planet.userData.info;
                this.planetInfo.classList.remove('hidden');
            } else {
                this.planetInfo.classList.add('hidden');
            }
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isPaused) {
            const delta = this.clock.getDelta();
            
            this.planets.forEach(planet => {
                planet.userData.angle += planet.userData.speed * delta * 60;
                planet.position.set(
                    Math.cos(planet.userData.angle) * planet.userData.distance,
                    0,
                    Math.sin(planet.userData.angle) * planet.userData.distance
                );
                
                planet.rotation.y += 0.01 * delta;
            });
            
            this.sunGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.001) * 0.05);
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SolarSystem();
});