import * as SPLAT from "gsplat";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const progressIndicator = document.getElementById("progress-indicator") as HTMLProgressElement;
const progressLabel = document.getElementById("TextLabel") as HTMLLabelElement;

const renderer = new SPLAT.WebGLRenderer(canvas);
const scene = new SPLAT.Scene();
const camera = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, canvas);

const format = "";
// const format = "polycam"; // Uncomment to use polycam format
async function main() {
    const frame = () => {
        controls.update();
        renderer.render(scene, camera);

        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    let loading = false;
    const selectFile = async (file: File) => {
        if (loading) return;
        loading = true;
        if (file.name.endsWith(".splat")) {
            await SPLAT.Loader.LoadFromFileAsync(file, scene, (progress: number) => {
                progressIndicator.value = progress * 100;
            });
        } else if (file.name.endsWith(".ply")) {
            await SPLAT.PLYLoader.LoadFromFileAsync(
                file,
                scene,
                (progress: number) => {
                    progressIndicator.value = progress * 100;
                },
                format,
            );
        }
        loading = false;
        progressLabel.textContent = "You can drag another file";
    };

    document.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer != null && e.dataTransfer.files.length > 0) {
            //clear the scene
            scene.reset();
            selectFile(e.dataTransfer.files[0]);
        }
        
    });
}

main();