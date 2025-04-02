import * as SPLAT from "gsplat";

// Get DOM elements
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const progressIndicator = document.getElementById("progress-indicator") as HTMLProgressElement;
const progressLabel = document.getElementById("TextLabel") as HTMLLabelElement;
const viewPlyButton = document.getElementById("view-ply") as HTMLButtonElement;
const plyUpload = document.getElementById("ply-upload") as HTMLInputElement;
const fileListContainer = document.getElementById("fileListContainer") as HTMLDivElement;
const fileList = document.getElementById("fileList") as HTMLSelectElement;
const loadSelectedFile = document.getElementById("loadSelectedFile") as HTMLButtonElement;

// Initialize SPLAT components
const renderer = new SPLAT.WebGLRenderer(canvas);
const scene = new SPLAT.Scene();
const camera = new SPLAT.Camera();
const controls = new SPLAT.OrbitControls(camera, canvas);

// Enhance controls for better user experience
controls.panSpeed = 0.8;
controls.zoomSpeed = 1.8;

// Available sample files
const sampleFiles = [
  { name: "Mẫu 1 - Phòng khách", url: "https://andyanh.id.vn/index.php/s/aSjWd9gRm5jyEeY" },
  { name: "Mẫu 2 - Nhà bếp", url: "https://andyanh.id.vn/index.php/s/aSjWd9gRm5jyEeY" },
  { name: "Mẫu 3 - Phòng ngủ", url: "https://andyanh.id.vn/index.php/s/aSjWd9gRm5jyEeY" }
];

async function main() {
  // Animation frame function with smooth camera transitions
  const frame = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  let loading = false;

  function updateProgress(progress: number, message?: string) {
    progressIndicator.value = progress;
    progressIndicator.style.visibility = "visible";
    if (message) {
      progressLabel.textContent = message;
      progressLabel.style.visibility = "visible";
    }
  }

  function hideProgress() {
    progressIndicator.style.visibility = "hidden";
    progressLabel.style.visibility = "hidden";
  }

  // Function to select and load file
  const selectFile = async (file: File) => {
    if (loading) {
      alert("Đang tải một tập tin khác, vui lòng đợi.");
      return;
    }
    loading = true;

    try {
      scene.reset(); // Clear the scene
      updateProgress(0, "Đang tải mô hình...");

      if (file.name.endsWith(".splat")) {
        await SPLAT.Loader.LoadFromFileAsync(file, scene, (progress: number) => {
          updateProgress(progress * 100);
        });
      } else if (file.name.endsWith(".ply")) {
        await SPLAT.PLYLoader.LoadFromFileAsync(
          file,
          scene,
          (progress: number) => {
            updateProgress(progress * 100, `Đang xử lý: ${Math.round(progress * 100)}%`);
          }
        );
      } else {
        throw new Error("Định dạng tập tin không được hỗ trợ");
      }

      updateProgress(100, "Tải thành công!");
      setTimeout(hideProgress, 2000);
    } catch (error) {
      console.error("Lỗi khi tải tập tin:", error);
      progressLabel.textContent = "Có lỗi xảy ra khi tải tập tin. Vui lòng thử lại.";
      progressLabel.style.visibility = "visible";
    } finally {
      loading = false;
    }
  };

  // Handle drop event with visual feedback
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.opacity = "0.8";
  });

  document.addEventListener("dragleave", () => {
    document.body.style.opacity = "1";
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.opacity = "1";

    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".ply") || file.name.endsWith(".splat")) {
        selectFile(file);
      } else {
        progressLabel.textContent = "Chỉ hỗ trợ tập tin .ply hoặc .splat";
        progressLabel.style.visibility = "visible";
      }
    }
  });

  // Handle View button for PLY/Splat files
  viewPlyButton.addEventListener("click", () => {
    const file = plyUpload.files?.[0];
    if (file) {
      selectFile(file);
    } else {
      progressLabel.textContent = "Vui lòng chọn tập tin .ply hoặc .splat trước.";
      progressLabel.style.visibility = "visible";
    }
  });

  // Initialize sample file list
  sampleFiles.forEach(file => {
    const option = document.createElement("option");
    option.value = file.url;
    option.textContent = file.name;
    fileList.appendChild(option);
  });

  // Handle sample file selection
  document.getElementById('selectFromLinkButton')?.addEventListener('click', () => {
    fileListContainer.style.display = 'block';
  });

  loadSelectedFile.addEventListener('click', async () => {
    const selectedUrl = fileList.value;
    if (!selectedUrl) {
      alert("Vui lòng chọn một mẫu từ danh sách");
      return;
    }

    try {
      updateProgress(0, "Đang tải mẫu...");
      const response = await fetch(selectedUrl);
      if (!response.ok) throw new Error('Lỗi kết nối');
      
      const blob = await response.blob();
      const file = new File([blob], 'sample.ply', { type: 'application/octet-stream' });
      await selectFile(file);
      
      fileListContainer.style.display = 'none';
    } catch (error) {
      console.error('Lỗi khi tải mẫu:', error);
      progressLabel.textContent = 'Không thể tải mẫu. Vui lòng thử lại sau.';
      progressLabel.style.visibility = "visible";
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

main();