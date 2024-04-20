
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 600;
const canvasScale = canvas.style.scale

const svg = `
    <svg width="175" height="348" viewBox="0 0 175 348" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M130.86 87.4392C155.016 87.4392 174.234 68.2214 174.234 44.0653C174.234 19.9093 155.016 0.691406 130.86 0.691406C106.704 0.691406 87.4861 19.9093 87.4861 44.0653C87.4861 68.2214 68.2682 87.4392 44.1122 87.4392C19.9561 87.4392 0.738281 106.657 0.738281 130.813C0.738281 154.969 19.9561 174.187 44.1122 174.187C68.2682 174.187 87.4861 193.405 87.4861 217.561C87.4861 241.717 68.2682 260.935 44.1122 260.935C19.9773 260.959 0.738281 280.168 0.738281 304.309C0.738281 328.465 19.9561 347.683 44.1122 347.683C68.2682 347.683 87.4861 328.465 87.4861 304.309C87.4861 280.153 106.704 260.935 130.86 260.935C155.016 260.935 174.234 241.717 174.234 217.561C174.234 193.405 155.016 174.187 130.86 174.187C106.704 174.187 87.4861 154.969 87.4861 130.813C87.4861 106.657 106.704 87.4392 130.86 87.4392Z" fill="#2F2F2F"/>
    </svg>
`

class Particle {
    constructor(effect, x, y, color) {
        this.effect = effect;
        this.color = color;
        this.originX = x;
        this.originY = y;
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.min(this.effect.canvasWidth, this.effect.canvasHeight) / 2;
        this.x = this.effect.canvasWidth / 2 + Math.cos(angle) * radius;
        this.y = this.effect.canvasHeight / 2 + Math.sin(angle) * radius;
    
        this.size = this.effect.gap+1.3;
        this.dx = 0;
        this.dy = 0;
        this.vx = 0;
        this.vy = 0;
        this.force = 0;
        this.angle = 0;
        this.distance = 0;
        this.friction = Math.random() * 0.6 + 0.15;
        this.ease = Math.random() * 0.01 + 0.09;
    }
    draw() {
        this.effect.context.beginPath();
        this.effect.context.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
        this.effect.context.fillStyle = this.color;
        this.effect.context.fill();
        this.effect.context.closePath();
    }
    update() {
        this.dx = this.effect.mouse.x - this.x;
        this.dy = this.effect.mouse.y - this.y;
        this.distance = (this.dx * this.dx + this.dy * this.dy);
        this.force = -this.effect.mouse.radius / (this.distance);

        if (this.distance < this.effect.mouse.radius) {
            this.angle = Math.atan2(this.dy, this.dx);
            this.vx += this.force * Math.cos(this.angle);
            this.vy += this.force * Math.sin(this.angle);
        }
        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }
}

class Effect {
    constructor(context, canvasWidth, canvasHeight, canvasScale) {
        this.context = context;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.canvasScale = canvasScale;
        this.particles = [];
        this.gap = 1;
        this.mouse = {
            radius: 10000,
            x: 0,
            y: 0
        };
        window.addEventListener('mousemove', (e) => {
            const rect = this.context.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) / this.canvasScale;
            this.mouse.y = (e.clientY - rect.top) / this.canvasScale;
        });
    }

    drawSVG() {
        const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        img.onload = () => {
            this.context.drawImage(img, (this.canvasWidth - img.width) / 2, (this.canvasHeight - img.height) / 2);
            this.convertToParticles();
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    }

    convertToParticles() {
        this.particles = [];
        const imageData = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
        const pixels = imageData.data;
        for (let y = 0; y < this.canvasHeight; y += this.gap) {
            for (let x = 0; x < this.canvasWidth; x += this.gap) {
                const index = (y * this.canvasWidth + x) * 4;
                const alpha = pixels[index + 3];
                if (alpha > 0) {
                    const red = pixels[index];
                    const green = pixels[index + 1];
                    const blue = pixels[index + 2];
                    const color = `rgb(${red}, ${green}, ${blue})`;
                    this.particles.push(new Particle(this, x, y, color));
                }
            }
        }
    }
    render() {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
    }
    changeEase() {
        for ( let x = 0; x < this.particles.length; x++) {
            console.log(this.particles[x].ease)
        }
    }
}
const effect = new Effect(ctx, canvas.width, canvas.height, canvasScale);
effect.drawSVG();
effect.render();

function animate() {
    effect.render();
    requestAnimationFrame(animate);
}

animate();