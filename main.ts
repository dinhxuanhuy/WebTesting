import * as SPLAT from "gsplat";

// Get DOM elements
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const progressIndicator = document.getElementById("progress-indicator") as HTMLProgressElement;
const progressLabel = document.getElementById("TextLabel") as HTMLLabelElement;
const viewPlyButton = document.getElementById("view-ply") as HTMLButtonElement;
const plyUpload = document.getElementById("ply-upload") as HTMLInputElement;

// Initialize SPLAT components
const renderer = new SPLAT.WebGLRenderer(canvas);
const scene = new SPLAT.Scene();
const camera = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, canvas);

// Increase controls speed when zooming in/out
controls.panSpeed = 0.5;
controls.zoomSpeed = 1.5;

const format = "";

async function main() {
  // Animation frame function
  const frame = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  let loading = false;

  // Function to select and load file
  const selectFile = async (file: File) => {
    if (loading) return;
    loading = true;

    try {
      scene.reset(); // Clear the scene

      if (file.name.endsWith(".splat")) {
        await SPLAT.Loader.LoadFromFileAsync(file, scene);
      } else if (file.name.endsWith(".ply")) {
        await SPLAT.PLYLoader.LoadFromFileAsync(
          file,
          scene,
          (progress) => {
            progressIndicator.value = progress * 100;
          },
          format // 'binary_little_endian' can be added here if needed
        );
      }

      progressLabel.textContent = "File loaded successfully.";
      setTimeout(() => {
        progressLabel.textContent = "";
        progressLabel.style.visibility = "hidden";
      }, 5000);
      progressIndicator.style.visibility = "hidden";
    } catch (error) {
      console.error("Error loading file:", error);
      progressLabel.textContent = "Error loading file. Check console.";
    } finally {
      loading = false;
    }
  };

  // Handle drop event
  document.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      selectFile(e.dataTransfer.files[0]);
    }
  });

  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  // Handle View button for PLY/Splat files
  viewPlyButton.addEventListener("click", () => {
    const file = plyUpload.files?.[0];
    if (file) {
      selectFile(file);
    } else {
      progressLabel.textContent = "Please select a .ply or .splat file first.";
    }
  });
document.getElementById('selectFromLinkButton')?.addEventListener('click', async () => {
    const url = 'https://andyanh.id.vn/index.php/s/aSjWd9gRm5jyEeY';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const blob = await response.blob();
        const file = new File([blob], 'downloaded.ply', { type: blob.type });
        const fileInput = document.getElementById('ply-upload') as HTMLInputElement;
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        alert('File selected from link successfully!');
    } catch (error) {
        console.error('Error fetching file:', error);
        console.error('Error fetching file:', error);
        alert('Failed to fetch file from link. Check console for details.');
    }
});
}

main();