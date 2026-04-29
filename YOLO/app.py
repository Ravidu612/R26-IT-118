import os
from pathlib import Path

import cv2
import gradio as gr
import numpy as np
from PIL import Image
from ultralytics import YOLO

DEFAULT_MODEL_NAME = "best.pt"
TABLE_HEADERS = ["class_name", "confidence", "x1", "y1", "x2", "y2"]


def resolve_model_path() -> Path:
    model_path_raw = os.getenv("YOLO_MODEL_PATH", DEFAULT_MODEL_NAME).strip() or DEFAULT_MODEL_NAME
    model_path = Path(model_path_raw).expanduser()

    if not model_path.is_absolute():
        model_path = Path(__file__).resolve().parent / model_path

    return model_path


MODEL_PATH = resolve_model_path()
if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"YOLO model file not found at '{MODEL_PATH}'. "
        f"Set YOLO_MODEL_PATH or place '{DEFAULT_MODEL_NAME}' in the project root."
    )

MODEL = YOLO(str(MODEL_PATH))


def format_detections(result) -> list[list[object]]:
    boxes = result.boxes
    if boxes is None or len(boxes) == 0:
        return [["No objects detected", "", "", "", "", ""]]

    xyxy = boxes.xyxy.cpu().numpy()
    cls_ids = boxes.cls.cpu().numpy().astype(int)
    confidences = boxes.conf.cpu().numpy()
    names = result.names

    rows: list[list[object]] = []
    for cls_id, conf, box in zip(cls_ids, confidences, xyxy):
        if isinstance(names, dict):
            class_name = names.get(int(cls_id), str(int(cls_id)))
        elif isinstance(names, list) and 0 <= int(cls_id) < len(names):
            class_name = names[int(cls_id)]
        else:
            class_name = str(int(cls_id))
        x1, y1, x2, y2 = [round(float(value), 2) for value in box.tolist()]
        rows.append([class_name, round(float(conf), 4), x1, y1, x2, y2])

    return rows


def predict(image: Image.Image, conf: float, iou: float, imgsz: int) -> tuple[Image.Image, list[list[object]]]:
    if image is None:
        raise gr.Error("Please upload an image before running detection.")

    image_np = np.array(image.convert("RGB"))
    results = MODEL.predict(
        source=image_np,
        conf=float(conf),
        iou=float(iou),
        imgsz=int(imgsz),
        device="cpu",
        verbose=False,
    )

    result = results[0]
    annotated_bgr = result.plot()
    annotated_rgb = cv2.cvtColor(annotated_bgr, cv2.COLOR_BGR2RGB)
    annotated_image = Image.fromarray(annotated_rgb)
    detection_rows = format_detections(result)

    return annotated_image, detection_rows


with gr.Blocks(title="Ultralytics YOLO Detector") as demo:
    gr.Markdown("# Ultralytics YOLO Image Detector")
    gr.Markdown(f"Loaded model: `{MODEL_PATH.name}`")

    with gr.Row():
        with gr.Column():
            input_image = gr.Image(type="pil", label="Upload Image")
            conf_slider = gr.Slider(
                minimum=0.0,
                maximum=1.0,
                value=0.25,
                step=0.01,
                label="Confidence Threshold",
            )
            iou_slider = gr.Slider(
                minimum=0.0,
                maximum=1.0,
                value=0.45,
                step=0.01,
                label="IoU Threshold",
            )
            imgsz_dropdown = gr.Dropdown(
                choices=[320, 416, 512, 640, 960, 1280],
                value=640,
                label="Inference Image Size",
            )
            run_button = gr.Button("Run YOLO Prediction", variant="primary")

        with gr.Column():
            annotated_output = gr.Image(type="pil", label="Annotated Output Image")
            detections_output = gr.Dataframe(
                headers=TABLE_HEADERS,
                datatype=["str", "number", "number", "number", "number", "number"],
                interactive=False,
                label="Detection Results",
            )

    run_button.click(
        fn=predict,
        inputs=[input_image, conf_slider, iou_slider, imgsz_dropdown],
        outputs=[annotated_output, detections_output],
    )


if __name__ == "__main__":
    demo.launch()