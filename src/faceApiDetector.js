import { APP_CONFIG } from "./config.js";

export class FaceApiSmileDetector {
  constructor(faceapi, { modelPath = APP_CONFIG.MODEL_PATH, minConfidence = APP_CONFIG.MIN_CONFIDENCE } = {}) {
    this.faceapi = faceapi;
    this.modelPath = modelPath;
    this.minConfidence = minConfidence;
  }

  async loadModels() {
    await Promise.all([
      this.faceapi.nets.ssdMobilenetv1.loadFromUri(this.modelPath),
      this.faceapi.nets.faceLandmark68Net.loadFromUri(this.modelPath),
      this.faceapi.nets.faceExpressionNet.loadFromUri(this.modelPath),
    ]);
  }

  syncOverlay(canvas, video) {
    const width = video.videoWidth || video.clientWidth;
    const height = video.videoHeight || video.clientHeight;

    if (!width || !height) {
      return null;
    }

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      this.faceapi.matchDimensions(canvas, { width, height });
    }

    return { width, height };
  }

  async detect(video) {
    const detections = await this.faceapi
      .detectAllFaces(video, new this.faceapi.SsdMobilenetv1Options({ minConfidence: this.minConfidence }))
      .withFaceLandmarks()
      .withFaceExpressions();

    const faces = detections.map((detection) => ({
      box: detection.detection.box,
      xCenter: detection.detection.box.x + detection.detection.box.width / 2,
      happy: detection.expressions.happy ?? 0,
      expressions: detection.expressions,
    }));

    return { detections, faces };
  }

  draw(canvas, detections, displaySize) {
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!detections.length) {
      return;
    }

    const resizedDetections = this.faceapi.resizeResults(detections, displaySize);
    this.faceapi.draw.drawDetections(canvas, resizedDetections);
    this.faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }

  clear(canvas) {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
}
