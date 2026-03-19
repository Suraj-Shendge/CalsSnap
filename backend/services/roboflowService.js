// backend/services/roboflowService.js

import fetch from "node-fetch";
import FormData from "form-data";
import {
  ROBOFLOW_PRIVATE_API,
  ROBOFLOW_MODEL_URL,
} from "../config.js";

export async function detectFoodRoboflow(imageBuffer) {
  const form = new FormData();

  form.append("file", imageBuffer, {
    filename: "upload.jpg",
    contentType: "image/jpeg",
  });

  const endpoint = `${ROBOFLOW_MODEL_URL}?api_key=${ROBOFLOW_PRIVATE_API}`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Roboflow error ${response.status}: ${txt}`);
  }

  const result = await response.json();

  const predictions = result?.predictions || result?.objects || [];

  return predictions.map((p) => ({
    label: p.class || p.label || "",
    confidence: p.confidence ?? 0,
    box: {
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
    },
  }));
}
